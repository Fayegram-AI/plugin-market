# Git Handling Policy

Use this policy only inside coding-focused Codex `/goal` runs.

## Purpose

Make git handling intentional without surprising the user. Prefer safe branch isolation and milestone commits for long coding goals, but never at the cost of preserving user edits or repository history.

## Authorization

Invoking `$coding-goal-guardrails` does not by itself authorize branch creation or commits. It authorizes only git inspection and git-state reporting.

Recognize these explicit goal phrases:

- `git: branch` grants permission to create or use a goal branch when useful and safe; it does not require a new branch.
- `git: milestone commits` means Codex may commit coherent verified milestones when safe.
- `git: branch + milestone commits` means Codex may do both when safe.
- `git: no branch` means do not create or switch branches.
- `git: no commits` means do not commit.

Natural-language permission such as "you may create a branch" is equivalent to `git: branch`. A direct instruction such as "create a branch for this goal" requires branch creation when safe; report the reason when repository state prevents it. "Commit verified milestones as you go" directly authorizes the corresponding commits.

Recognize authorization already given for the exact action, target, and known state. Do not ask again solely because a worktree or file is dirty when the user has authorized carrying those identified edits or committing isolated goal-owned hunks. Recheck current effects: changed scope, unresolved ownership, an ambiguous base, or unsafe repository state still requires resolution. An explicit approval-first boundary remains binding.

## Initial Git Check

Before meaningful edits, inspect and record:

- Whether the workspace is a git repository.
- Current branch.
- Current HEAD/base commit when available.
- Dirty or clean status.
- Files already modified before Codex changes.
- Whether merge, rebase, cherry-pick, bisect, or conflict resolution appears active.
- Whether branch or commit preauthorization was given.

Treat pre-existing dirty files as user-owned unless the user explicitly says otherwise.

## Branch Creation

Automatic branch creation is allowed only when all are true:

- The user preauthorized it with `git: branch` or equivalent.
- The workspace is a git repository.
- The worktree is clean, or the user explicitly authorized carrying the identified uncommitted changes from the confirmed base without losing edits.
- HEAD is not detached.
- No merge, rebase, cherry-pick, bisect, or conflict resolution appears active.
- The current branch is a default/integration branch, or the user explicitly requested a new branch.
- The branch name can be derived clearly from the goal.
- The branch does not already exist, or using the existing branch is clearly intended.
- Creating the branch is non-destructive.

Ask before branch creation when:

- No branch preauthorization was given.
- Carrying identified dirty changes has not been authorized or its effects are unresolved.
- The current branch looks like a feature/topic branch and a new branch from the confirmed base has not already been explicitly requested.
- The base branch is ambiguous.
- HEAD is detached.
- The proposed branch name conflicts with an existing branch.
- The set of uncommitted changes to carry is unknown or outside authorization.
- The repository is in an unusual state.

Skip branch creation when:

- The user said `git: no branch`.
- The workspace is not a git repository.
- The current branch is already suitable for the goal, unless the user directly instructed Codex to create a new branch.
- The task is small and branch isolation adds no value, unless the user directly instructed Codex to create a branch.
- The repository is mid-merge, mid-rebase, mid-cherry-pick, or otherwise unsafe.
- Safe branch creation would require stash, reset, clean, rebase, checkout-overwrite, or another destructive operation.

## Dirty Worktrees And User Edits

Preserve user edits.

When the worktree is dirty at activation:

- Record the dirty state before editing.
- Treat existing modified or untracked files as user-owned.
- Do not reset, clean, stash, checkout over, or discard changes.
- Do not include pre-existing user-owned changes in commits.
- Avoid editing dirty files unless necessary for the goal.
- When editing a dirty file is necessary, inspect existing changes first and preserve them.
- If ownership or merge intent is ambiguous, ask before editing or committing that file.

Never use destructive git operations unless the user explicitly instructs that exact operation. Branch or commit preauthorization does not authorize reset, clean, stash, amend, rebase, squash, force-push, branch deletion, or history rewrites.

## Step-Wise Commits

Use milestone commits for long coding `/goal` runs only when preauthorized or confirmed.

A milestone commit is allowed only when all are true:

- The user preauthorized milestone commits or approved this commit.
- The milestone is coherent and reviewable.
- The diff is scoped to the goal.
- Only goal-owned files or cleanly isolated goal-owned hunks are staged.
- Pre-existing user edits are excluded.
- Relevant validation has passed, or the commit message/handoff clearly states what was not validated and why.
- The current git status was checked immediately before staging and committing.

Do not commit after every small edit. Commit after coherent verified milestones, such as:

- Reproduction or failing test added.
- Core implementation completed and targeted tests pass.
- Refactor slice completed with behavior-preserving validation.
- Migration slice completed with relevant checks.
- Final cleanup completed with final validation.

Ask before committing when:

- Commit preauthorization was not given.
- Validation is incomplete and a checkpoint with those disclosed gaps has not been authorized.
- The intended commit includes unresolved mixed concerns.
- A previously dirty file has unresolved hunk ownership or the exact proposed goal-owned hunk scope has not been authorized.
- The commit would include generated files, lockfiles, migrations, snapshots, or large mechanical changes not explicitly expected.

Skip commits when:

- The user said `git: no commits`.
- Changes are unverified work in progress.
- Validation is failing and the user did not request a checkpoint commit.
- User-owned edits cannot be cleanly separated.
- The repository state is unsafe or ambiguous.

Never push, force-push, amend, squash, rebase, reset, clean, delete branches, or rewrite history unless the user explicitly requests that operation.

## Handoff Git Summary

Include a concise git summary:

```text
Branch before:
Branch after:
Branch created:
Commit mode:
Commits made:
Uncommitted changes:
Pre-existing user edits preserved:
Files changed:
Validation tied to commits/diff:
Git follow-up needed:
```
