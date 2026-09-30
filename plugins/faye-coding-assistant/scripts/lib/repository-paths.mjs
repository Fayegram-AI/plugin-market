// Cross-platform repository path helpers shared by plugin scripts.

import {
    isAbsolute,
    relative,
    resolve,
    sep
} from "node:path";

export function toDisplayPath(value) {
    return String(value).split(sep).join("/").replace(/^\.\//, "");
}

export function fromDisplayPath(value) {
    return String(value).split("/").join(sep);
}

export function comparePaths(left, right) {
    const leftText = String(left ?? "");
    const rightText = String(right ?? "");
    const normalizedLeft = leftText.toLowerCase();
    const normalizedRight = rightText.toLowerCase();

    if (normalizedLeft !== normalizedRight) {
        return normalizedLeft < normalizedRight ? -1 : 1;
    }

    return leftText === rightText ? 0 : (leftText < rightText ? -1 : 1);
}

export function isContainedPath(root, candidate) {
    const relativePath = relative(resolve(root), resolve(candidate));
    return relativePath === "" || (
        !isAbsolute(relativePath)
        && relativePath !== ".."
        && !relativePath.startsWith(`..${sep}`)
    );
}
