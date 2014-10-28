And now ~~an intro to~~ complete tutorial for Git!
--------------------

It's completely possible to use git without knowing these things (especially with some of the guis), but a glimpse into the internals will actually make it a lot easier to use and remember why things are the way they are, even if it looks confusing at first.  It's actually not that bad!


In TFS there is one server.  When you check out the code, you copy the latest version of each file's contents down to your working directory.  The change log is linear, meaning you can view history and see commits 1 through 48561 all in a row.  When you want to check in changes you need to contact that server.  If you want to see an old version of the file you have to contact that server.  If you want a "branch" you have to copy all the code to a new folder and maintain the changes between the two.  A TFS server is a web service where all "intelligent" operations are carried out by that single server.  If you can't get online or the server is down, you're out of luck.


Git is a bit different.  You can think of it in two pieces: the data and operations on that data.  A complete git repository consists of any folder with a `.git` folder inside.  You can create one any time you want using `git init`.  You can turn your Documents folder into a git repo if you care about tracking changes over time.  The .git folder contains both compressed and hashed versions of everything ever committed to the repository.


Let's look at the operations you will normally run on your repos.  Don't feel like you need to memorize these.  They'll become muscle memory fast and until then you can refer to this list or ask me:

`git clone [url]`: This actually runs a few other commands for you, but you can just think of it as an initial checkout.  Cloning a repo creates a complete copy wherever you run this command, including all history (which actually isn't expensive).  As long as you aren't urgently needing a change from someone else you can work completely offline.

`git status`: Prints all staged changes followed by all unstaged changes.  We'll talk more about the staging area below

`git add [path]`: Stages the changes matching the path (`git add -A` will stage all changes).  Remember that, unlike TFS, you are staging changes, not files.  If you change the file again after staging you will need to stage that change too

`git reset [path]`: Opposite of add, unstages the changes matching the path

`git commit -m "[message]"`: Converts the staged changes to a complete commit.  Commits are immutable -- I'll come back to this later

`git branch`: List branches, with an * next to the current branch

`git branch [name]`: Creates a new branch, but doesn't switch to it

`git checkout [name]`: Switch to another branch

`git checkout -b [name]`: Shortcut for `git branch [name] && git checkout [name]`

`git merge [name]`: Merges all changes from another branch

`git log`: Print the commit history, lots of display options


Commits and Branches
--------------------

As I mentioned earlier, a commit in git is immutable.  It consists of a few things:

- the message
- a parent commit
- a new hash for every file changed
- a binary blob (blob is the actual word used for these files) of only those changes

Once a commit is created it can never be changed.  It is possible (and not uncommon) to rewrite history in git, but to do so every commit after the one you want to change needs to be rebuilt, and will then appear to be a completely different commit.  This will become important when we talk about Local vs Remote.

Commits are represented by guids, but usually you'll only see the first few characters.  As long as it's enough of the hash to be unique it's enough.  Commit hashes have no order, but they always have a parent commit.  Here are 3 example commits:

```
abc - - - abd - - - abe
```

The commit `abe` represents all changes since it's parent commit, `abd`.  It doesn't contain any other data, so it's very small.  Git can do this because commits are immutable.  abd can never change, so abe does not need to capture anything more than the hash of it's parent.  If a file has not changed since the repo was created, it will always be identified by that initial commit's blob.  If it's changed, only the changes are captured in those later commits.

Now let's look at branches.  In git, a branch is a pointer to a commit.  Creating a branch is as fast as writing one commit's hash to a file.  Suppose we have one branched called master:

```
abc - - - abd - - - abe <-- master
```

If we commit again, master automatically is rewritten to the new commit, since it was the active branch:

```
abc - - - abd - - - abe - - - abf <-- master
```

You can name a branch almost anything, but there's one magic branch that's always there which git controls for you:

```
abc - - - abd - - - abe - - - abf <-- master <-- HEAD
```

HEAD is a special branch.  All it is is another pointer, but instead of referring to a commit, it usually refers to another branch.  HEAD is the branch git uses to keep track of the current working directory.  The `git checkout [name]` command just writes the specified branch name as the HEAD pointer.  HEAD can still point directly to a commit though. `git checkout abe` will point HEAD back to that commit (and update the files in the current working directory):

```
abc - - - abd - - - abe - - - abf <-- master
                     ^-- HEAD
```

This is called a "detached HEAD" state.  If you see warnings about being in a detached HEAD state it simply means HEAD is not pointing to a branch.  This is ok if you know why you're in this state, but isn't something you want to ignore if you didn't mean to do it.  Suppose we commit now:

```
abc - - - abd - - - abe - - - abf <-- master
                      \ 
                       abg <-- HEAD
```

And then `git checkout master`:

```
abc - - - abd - - - abe - - - abf <-- master <-- HEAD
                      \ 
                       abg
```

The commit `abg` is now all on its own with no branch justifying it's existance.  The only way to get to it is to check it out by name: `git checkout abg`.  Git will garbage collect commits like these, and they don't show up in normal logs.  Just make sure you never commit in this state and you'll be safe.  If you need to commit (like for a patch), create a branch: `git checkout abg && git checkout -b patch`:

```
abc - - - abd - - - abe - - - abf <-- master
                      \ 
                       abg <-- patch <-- HEAD
```

Let's merge abg: `git checkout master && git merge patch`:

```
abc - - - abd - - - abe - - - abf - - - abh <-- master <-- HEAD
                      \                /  ^-- patch
                       abg - - - - - -
```

And now we don't need our patch pointer anymore, so we can delete that branch: `git branch -d patch`:

```
abc - - - abd - - - abe - - - abf - - - abh <-- master <-- HEAD
                      \                /
                       abg - - - - - -
```

The merge we just did is the most complicated kind.  There were changes on both sides, so the merge created a new commit to mimic the work done in the patch branch on the master branch.

Let's look at a more common example using a short-lived feature branch:

```
abc - - - abd - - - abe <-- master
                      \ 
                       abf <-- feature-1 <-- HEAD
```

Here we branched master to create feature-1 and then created a new commit on that branch.  Let's merge it: `git checkout master && git merge feature-1`

```
abc - - - abd - - - abe
                      \ 
                       abf <-- master <-- HEAD
                        ^-- feature-1
```

This is called a fast-foward merge, and git will automatically detect and perform this merge when possible.  Git realized it didn't need to do anything and simply moved the master branch to point to abf.  This is nice for a few reasons:

- It's instant
- Merge conflicts are impossible
- The commit log won't have that extra merge commit hanging around.

There's a 3rd type of merge called a rebase.  Suppose there had been another change on master (likely from someone else committing since you created your feature branch):

```
abc - - - abd - - - abe - - - abg <-- master
                      \ 
                       abf <-- feature-1 <-- HEAD
```

`git rebase master` (important!! don't use this until you've finished reading the section below on remotes!):


```
abc - - - abd - - - abe - - - abg <-- master
                                \
                                 abh <-- feature-1 <-- HEAD
```

This destroyed the commit `abf`, created a new one, `abh` with `abg` as it's parent, with all the same changes that used to be in `abf`, and then pointed feature-1 to the new commit.  This is one of the ways you can rewrite history in git.  feature-1 can now be merged back to master using a fast-forward merge!


Remotes
--------------------

In git, a remote is another copy of the same repo.  It could be another folder on your computer where you've copied the code, a team member's computer, or (almost always) a server like github.  The `git clone [url]` command actually does this:

`git init && git remote add origin [url] && git fetch origin`

This means that by default you will always have a remote named `origin` available to fetch/pull/push to.  Here's how you interact with it:

`git fetch [name]`: Copies the remote changes to your local repo, but does not affect your local branches

`git pull [name] [branch]`: Shortcut for `git fetch [name] && git merge [name]/[branch]`

`git push`: Opposite of fetch.  The first time you do a push from a local branch you have to tell git which remote to use: `git push -u origin master` would tell your current local branch (hopefully master!!) to push to the branch called master on the remote called origin.  After that any `git push` from the master branch will use those settings.

Pushing changes to a remote is pretty simple, but there are a few rules:

- You can't push to a branch if you don't have latest.  Git will stop your push if it detects this.
- Pushing is normally specific to a branch.  If you don't push a branch it will be local only.

(and..)
- ONLY LOCAL BRANCHES CAN BE REBASED!!  Actually, only local branches SHOULD ever be rebased, because git will let you do it.  The reason is that commits are immutable.  If you rebase a shared branch you're rewriting all commits involved.  Someone else will have their own new commits with the now destroyed commits in their history.  You never want to rewrite history on shared commits.  Fortunately git will only let you push rewritten history using the --force flag.  If you're ever unsure just do a normal merge commit.

- `git commit --ammend` lets you rewrite the most recent commit on active branch.  The same rules apply here as rebasing -- never ammend a shared commit.  If you need to undo shared commits use `git revert [hash]`.  It will undo the changes as a new commit.


Staging Area
--------------------

Let's go back to `git add` for a minute.  `git add` stages changes in preparation for the next commit.  `git stage` is actually an alias for `git add` if that's easier to remember.  This is the same as a real commit, except that it hasn't been added to the commit log yet.  It's important to remember that adding files actually means "the current version of the file".  In TFS the file as a whole is either included or excluded, and when you commit it will read the file at that time and save whatever is there.  In git you are adding changes, not files.  You could change lines 10 and 13, but only add/stage the change on line 10.  Changing line 10 again would be seen as a new change which would need to be added to the staging area again to be included in the checkin.

Always run `git status` and `git diff HEAD` to see what you'll actually be committing.  Here's a common workflow:

`git checkout -b [feature-related-name-for-you-to-remember]`

[make some changes]

`git add .` (or git add -A) to stage the changes

`git diff HEAD` to run a diff between the most recent real commit and the staged changes

`git commit -m "[message]"` to commit those changes

[repeat until feature is done, merge from master periodically if necessary: `git merge master`]

`git checkout master`

`git merge feature-...`

`git push`

`git branch -d feature-...`

Both the staging area and any untracked commits are separate from the active branch, and switching branches will merge any changes in.  If you make changes on master and decide you want a branch to work in, just create one and switch to it.  The staging area will still be the same.  This is because nothing was committed to master, and branches are just pointers.  If the changes went away when you switched branches there'd be no where to store them.  This is actually what you want 95% of the time.  For the other 5% there's a `git stash` feature.  This is kind of like shelvesets in TFS except for them being local.  But branches are so cheap there's not much reason to use a storage bucket that doesn't understand history and relationships the way commits and branches do.


Tags
--------------------

Tags are pointers to commits, just like branches, but they never change once created.  You can think of branches as the labels tracking active dev paths, while tags mark significant points in time (usually releases/versions).  You can checkout, diff, and merge tags just like you can with any branch or commit.


Congratulations!
--------------------

You're now a git master! (get it?....)  If you get stuck with any terms or aren't sure how to do something just ask me or check out [git ready](https://gitready.com) or [Atlassian's Git tutorials](https://www.atlassian.com/git/tutorials).  They've got great tutorials for every command as well as a lot of the concepts.
