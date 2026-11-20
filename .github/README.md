# T3 Code + native Dim

A personal fork of [T3 Code](https://github.com/pingdotgg/t3code) that adds a native **Dim** provider to the server. It drives the `dima` daemon over Dim's own protocol instead of ACP. No client code changes: the official desktop app and the iOS and Android apps connect to this server like any other T3 Code server.

Everything else follows upstream; its README is [here](../README.md).

## What the fork adds

- `packages/provider-dim`: the Dim driver. `$name` mentions load Dim skills, images go to Dim as native image blocks, Code Mode child calls fold into their parent tool row, and conversations can be rolled back.
- `fork/t3-dim`: runs this fork's server in the background on macOS and keeps it up to date.

## Run it on a Mac

You need node, pnpm, `vite-plus` 1.4.0, git access to this repo, and `dima` on your PATH.

If the T3 Code desktop app runs on this Mac, turn off its built-in server first: **Settings → Environments → This app → Local environment**.

```bash
git clone git@github.com:yyhhyyyyyy/t3code.git
t3code/fork/t3-dim install    # builds main and starts a launchd agent
~/.t3-dim/bin/t3-dim pair     # prints a pairing link; open it on each device once
```

## Everyday commands

```text
t3-dim sync      rebase this fork onto upstream T3 Code; force-pushes only if the Dim checks pass
t3-dim update    build the latest main; switches once no agent run is active
t3-dim restart   start a staged build (refuses while agents run; --now forces it)
t3-dim status    server, release and Dim provider state
```

`t3-dim help` lists the rest. Updates keep every device paired: the data directory (`~/.t3`) and port (3780) never change after install.

## History

`main` is always upstream's `main` with this fork's commits on top, and no merge commits: `git log upstream/main..main` lists everything the fork adds. Because `t3-dim sync` rewrites those commits, update other clones with `git pull --rebase`, rebase open branches onto the new `main`, and merge pull requests here with **Rebase and merge**.

## Limits

- No T3 Connect: devices reach the server over the local network or Tailscale, and there are no lock-screen notifications.
- The official apps show Dim's settings read-only, with no icon, and the usage page does not list Dim.
