# Cross-platform-pair launcher for Faye Image Utility Python-backed scripts.
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [AllowEmptyString()]
    [string]$ScriptPath,

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$ScriptArguments,

    [Parameter(ValueFromPipeline = $true)]
    [AllowEmptyString()]
    [string]$PipelineInput
)

begin {
    $pipelineItems = [System.Collections.Generic.List[string]]::new()
}

process {
    if ($PSBoundParameters.ContainsKey("PipelineInput")) {
        $pipelineItems.Add($PipelineInput)
    }
}

end {
    $probePath = Join-Path $PSScriptRoot "python_runtime_probe.py"

    function Write-JsonError {
        param(
            [string]$Code,
            [string]$Message,
            [string[]]$InstallInstructions = @()
        )

        $payload = [ordered]@{
            status = "error"
            requirements = [ordered]@{
                python = ">=3.10"
                pillow = ">=12.3.0"
                colorManagement = "LittleCMS2"
            }
            error = [ordered]@{
                code = $Code
                message = $Message
                installInstructions = $InstallInstructions
            }
        }
        [Console]::Error.WriteLine(($payload | ConvertTo-Json -Depth 6 -Compress))
    }

    if ([string]::IsNullOrWhiteSpace($ScriptPath)) {
        Write-JsonError `
            -Code "python_script_missing" `
            -Message "A Python script path is required."
        exit 13
    }

    if (-not (Test-Path -LiteralPath $probePath -PathType Leaf) -or
        -not (Test-Path -LiteralPath (Join-Path $PSScriptRoot "runtime_bootstrap.py") -PathType Leaf)) {
        Write-JsonError `
            -Code "runtime_probe_missing" `
            -Message "The bundled Faye Image Utility Python runtime probe is missing: $probePath"
        exit 12
    }

    if (-not (Test-Path -LiteralPath $ScriptPath -PathType Leaf)) {
        Write-JsonError `
            -Code "python_script_missing" `
            -Message "The requested Faye Image Utility Python script does not exist: $ScriptPath"
        exit 13
    }

    $candidates = [System.Collections.Generic.List[object]]::new()
    if (-not [string]::IsNullOrWhiteSpace($env:FAYE_PYTHON)) {
        $candidates.Add([pscustomobject]@{
            Executable = $env:FAYE_PYTHON
            Prefix = @()
        })
    }
    else {
        $candidates.Add([pscustomobject]@{ Executable = "py"; Prefix = @("-3") })
        $candidates.Add([pscustomobject]@{ Executable = "python3"; Prefix = @() })
        $candidates.Add([pscustomobject]@{ Executable = "python"; Prefix = @() })
    }

    $bestFailure = $null
    $bestFailureCode = 1
    foreach ($candidate in $candidates) {
        if ($null -eq (Get-Command $candidate.Executable -ErrorAction SilentlyContinue)) {
            continue
        }

        $probeOutput = & $candidate.Executable @($candidate.Prefix) -B $probePath --base 2>&1
        $probeExitCode = $LASTEXITCODE
        $probeText = ($probeOutput | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
        try {
            $probeResult = $probeText | ConvertFrom-Json -ErrorAction Stop
        }
        catch {
            # Windows Store aliases and broken executables may look like commands
            # but do not provide a usable Python process. Try the next candidate.
            continue
        }

        if ($probeResult.status -eq "ok" -and $probeExitCode -eq 0) {
            if ($pipelineItems.Count -gt 0) {
                ($pipelineItems -join [Environment]::NewLine) |
                    & $candidate.Executable @($candidate.Prefix) -B (Join-Path $PSScriptRoot "runtime_bootstrap.py") $ScriptPath @ScriptArguments
            }
            else {
                & $candidate.Executable @($candidate.Prefix) -B (Join-Path $PSScriptRoot "runtime_bootstrap.py") $ScriptPath @ScriptArguments
            }
            exit $LASTEXITCODE
        }

        if ($probeResult.status -eq "error") {
            $bestFailure = $probeText
            $bestFailureCode = $probeExitCode
        }
    }

    if ($null -ne $bestFailure) {
        [Console]::Error.WriteLine($bestFailure)
        exit $bestFailureCode
    }

    Write-JsonError `
        -Code "python_not_found" `
        -Message "Faye Image Utility requires Python 3.10 or newer, but no usable Python interpreter was found." `
        -InstallInstructions @(
            'Windows: run: winget install -e --id Python.Python.3.12',
            "Alternative: install Python 3.10 or newer from https://www.python.org/downloads/windows/ and enable 'Add python.exe to PATH'.",
            'Pillow>=12.3.0 is installed automatically into the project-local runtime after Python is available.',
            "Rerun the original Faye Image Utility command after installation."
        )
    exit 10
}
