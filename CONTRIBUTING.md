# Contributing to twitter-v2

:+1: First off, thanks for taking the time to contribute! :+1:

The following is a set of guidelines for contributing to twitter-v2 and its
packages, which are hosted on [npm](https://www.npmjs.com/package/twitter-v2).
These are mostly guidelines, not rules. Use your best judgment, and feel free to
propose changes to this document in a pull request.

#### Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)

- [Design Decisions](#design-decisions)

[How Can I Contribute?](#how-can-i-contribute)

- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Pull Requests](#pull-requests)

## What should I know before I get started?

### Design Decisions

This is still a small project, so design decisions are still made somewhat
informally through discussion in pull requests and issues. However, broadly
speaking there are a few ideas that are consistent.

- twitter-v2 is a thin client. Unlike some other packages (see
  [twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2) for an example)
  we're not trying to abstract Twitter's API layer through an ORM. We aim to
  simplify usage of Twitter's rest endpoints. This is less of a philosophical
  decision, and more of a practical one. By operating at the HTTP-layer, any new
  changes to the Twitter API are supported immediately by this package.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these
guidelines helps maintainers and the community understand your report and
reproduce the behavior.

Before creating bug reports, please check
[this list](#before-submitting-a-bug-report) as you might find out that you
don't need to create one. When you are creating a bug report, please
[include as many details as possible](#how-do-i-submit-a-good-bug-report). Fill
out [the required template](.github/ISSUE_TEMPLATE/bug_report.md), the
information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing
> that you're experiencing, open a new issue and include a link to the original
> issue in the body of your new one.

#### Before Submitting A Bug Report

- **Perform a [cursory search](https://github.com/hunterlarco/twitter-v2/issues)**
  to see if the problem has already been reported. If it has **and the issue is
  still open**, add a comment to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://github.com/hunterlarco/twitter-v2/issues).
Create an issue and provide the following information by filling in
[the template](.github/ISSUE_TEMPLATE/bug_report.md).

Explain the problem and include additional details to help maintainers reproduce
the problem:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as
  possible. For example, start by explaining how you configured your
  authentication and which version of twitter-v2 you are using. When listing
  steps, **don't just say what you did, but explain how you did it**. For
  example, if you experienced a stream failure, did you leave it running
  overnight or for five minutes? What does your `.close()` logic look like?
- **Provide specific examples to demonstrate the steps**. Include links to files
  or GitHub projects, or copy/pasteable snippets, which you use in those
  examples. If you're providing snippets in the issue, use
  [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
- **Describe the behavior you observed after following the steps** and point out
  what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **If you're reporting that twitter-v2 crashed**, include the stack trace.
- **If the problem wasn't triggered by a specific action**, describe what you
  were doing before the problem happened and any environment-related information
  that might be unusual. Are you running an old version of node? Running in a
  memory-squeezed VM? Etc...

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including
completely new features and minor improvements to existing functionality.
Following these guidelines helps maintainers and the community understand your
suggestion.

Before creating enhancement suggestions, please check
[this list](#before-submitting-an-enhancement-suggestion) as you might find out
that you don't need to create one. When you are creating an enhancement
suggestion, please [include as many details as possible](#how-do-i-submit-a-good-enhancement-suggestion).
Fill in [the template](.github/ISSUE_TEMPLATE/feature_request.md), including the
steps that you imagine you would take if the feature you're requesting existed.

#### Before Submitting An Enhancement Suggestion

- **Perform a [cursory search](https://github.com/HunterLarco/twitter-v2/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)**
  to see if the enhancement has already been suggested. If it has, add a comment
  to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/HunterLarco/twitter-v2/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement).

- **Use a clear and descriptive title** for the issue to identify the
  suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many
  details as possible.
- **Provide specific examples to demonstrate the steps**. Include copy/pasteable
  snippets which you use in those examples, as
  [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
- **Describe the current behavior** and **explain which behavior you expected to
  see instead** and why.
- **Explain why this enhancement would be useful** to most twitter-v2 users.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these
`good first issue` and `help wanted` issues:

- [Good first issues][good-first-issue] - issues which should only require a
  few lines of code, and a test or two.
- [Help wanted issues][help-wanted] - issues which should be a bit more involved
  than `good first issue` issues.

#### Local development

### Testing

We current support unit tests and end-to-end test; both of which can be run with
`npm test`. Note that end-to-end tests will require that you provide credentials
as environment variables to `npm test` EG:

```bash
TWITTER_CONSUMER_KEY=foo \
TWITTER_CONSUMER_SECRET=bar \
TWITTER_BEARER_TOKEN=baz \
npm test
```

or disable end-to-end tests like so:

```bash
TWITTER_DISABLE_E2E=1 npm test
```

### Pull Requests

The process described here has several goals:

- Maintain quality
- Fix problems that are important to users
- Enable a sustainable system for maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](.github/PULL_REQUEST_TEMPLATE.md)
2. Format your code (`npm run format-code`)
3. After you submit your pull request, verify that all
   [status checks](https://help.github.com/articles/about-status-checks/) are
   passing
   <details><summary>What if the status checks are failing?</summary>
   If a status check is failing, and you believe that the failure is unrelated
   to your change, please leave a comment on the pull request explaining why you
   believe the failure is unrelated. A maintainer will re-run the status check
   for you. If we conclude that the failure was a false positive, then we will
   open an issue to track that problem with our status check suite.</details>

[good-first-issue]: https://github.com/HunterLarco/twitter-v2/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22
[help-wanted]: https://github.com/HunterLarco/twitter-v2/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22
