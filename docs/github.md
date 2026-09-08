# GitHub workflow

NEMO is developed from Git from the first commit.

## First push

Create an empty public repository named `nemo` under the GitHub account `s0nic28`, then run:

```bash
git remote add origin https://github.com/s0nic28/nemo.git
git push -u origin main
```

Do not add a README, `.gitignore`, or license during repository creation because those files already exist in this project.

## Commit style

Use meaningful commits such as:

- `feat: add cursor gaze smoothing`
- `feat: add browser voice input`
- `fix: handle denied microphone permission`
- `perf: throttle face tracking`
- `docs: add camera privacy notes`

Each commit should correspond to a real change and should be pushed after it is verified locally.
