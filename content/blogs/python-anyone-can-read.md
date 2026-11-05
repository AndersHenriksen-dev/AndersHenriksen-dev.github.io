---
title: "Python Anyone Can Read"
date: 2026-11-05
author: "Anders Henriksen"
description: "How I structure Python so that a reader from any field or at any level can follow it: functions that read like chapters, code and config in matching folders, and types that catch mistakes early."
image: /images/blogs/python-book.svg
imageAlt: "A Python file drawn as a page. Small functions sit at the top, and the most general function sits at the bottom, where each of its lines points up at a chapter above"
tags: ["Python", "Code quality", "Software design"]
toc: true
---

Code is read by more people than the ones who write code all day. An analyst checks whether a calculation matches the contract. A domain expert asks why a number changed. A new colleague has to change a value on their second day. If only the author can follow the code, nobody else can trust it, check it or take it over.

<!--more-->

So I write Python for the reader with the least context, whatever their field or experience. That rule explains almost every habit in this post: pure functions, a fixed order on the page, config apart from code, one folder structure for everything, and types everywhere. None of them makes the code cleverer. Each one means there is less to hold in your head.

I will use one small program throughout. It reads a list of invoices, finds the overdue ones, adds a late fee and writes a report. You need no background in invoicing or in Python to follow the idea.

## The version most of us write first

Here is the whole program as a first version usually comes out. It works:

```python
def process(f, out):
    res = []
    for line in open(f).readlines()[1:]:
        p = line.strip().split(",")
        d = (date.today() - date.fromisoformat(p[3])).days
        if d > 14:
            x = float(p[2]) * 0.02 * d / 30
            if x < 25:
                x = 25
            res.append(p[0] + "  " + p[1] + "  " + str(d) + " days late  fee " + str(round(x, 2)))
    with open(out, "w") as o:
        o.write("\n".join(res))
```

Now try to answer some questions a colleague might ask. What is the grace period? Is it 14 days or is that something else? What is `p[3]`? If legal changes the rate from 2% to 3%, who edits this, and how do they test that nothing else broke? Could you test the fee without a file on disk, and get the same answer tomorrow?

You can find all of it, but you have to run the whole function in your head to do so. The rest of this post takes that function apart.

## Functions that take something and give something back

A pure function takes its input as arguments and returns its output. It reads no global state, changes nothing, and gives the same answer every time. That is all I mean by functional, and it is why I find functional code easier to understand: to know what a function does, you only read the function.

Compare a class that keeps its work in attributes:

```python
class InvoiceProcessor:
    def load(self, path): ...       # sets self.invoices
    def filter_late(self): ...      # needs load() first, sets self.late
    def add_fees(self): ...         # needs filter_late() first, changes self.late
```

To understand `add_fees` you need to know what ran before it and what it left behind. The order of the calls is a rule that exists only in the author's head. Here is the same step as a pure function:

```python
def find_late_fees(invoices: list[Invoice], today: date, rules: FeeRules) -> list[LateFee]:
    """Work out the fee on every invoice that is past its grace period."""
    return [
        LateFee(invoice, days, calculate_fee(invoice, days, rules))
        for invoice in invoices
        if (days := count_days_late(invoice, today)) > rules.grace_days
    ]
```

Everything it depends on is in its signature, including today's date. In the first version `date.today()` was buried in the loop, so the result changed every day and could not be tested without faking the clock. Here a test simply passes in a date.

My rule for classes follows from this: **classes hold data, functions do the work.** I do use a class with behavior when state truly belongs together, such as a client holding a network connection. That is rare.

Files, clocks and networks still have to happen somewhere, so I push them to the edges. The program reads at the start and writes at the end, and everything between is pure. Gary Bernhardt calls this a functional core with an imperative shell:

![The program as three layers, top to bottom. Files come in through a checking layer using Pydantic that stops bad data. The middle is pure functions passing dataclasses, with no files and no clock. The report is written at the bottom edge](/images/blogs/python-edges.svg)

## A page that reads like a book

Within a file, functions get more general as you go down the page. The top holds small details: one fact, one rule. Further down, functions combine them. The last function in the file is the most general one, and it reads like a table of contents, where each line is a chapter:

```python
def read_invoices(path: Path) -> list[Invoice]: ...

def format_line(late_fee: LateFee) -> str: ...

def format_report(late_fees: list[LateFee]) -> str: ...

def write_late_fee_report(invoices_path: Path, report_path: Path, today: date) -> None:
    """Read the invoices, work out the late fees and write the report."""
    invoices = read_invoices(invoices_path)
    late_fees = find_late_fees(invoices, today, RULES)
    report = format_report(late_fees)
    report_path.write_text(report, encoding="utf-8")
```

A reader with no Python can read those four lines out loud and tell you what the program does. That is the test I apply. A reader who needs more opens one chapter and ignores the others, as the picture at the top of this post shows.

So I open a file from the bottom. Some style guides, such as the stepdown rule in *Clean Code*, put the general function first. I go the other way because a reader going down the page has then seen every helper before it appears, and everyone knows where to find the summary. Either order works if a codebase sticks to it. What matters is that nobody has to search for where the story is.

Two habits make the chapters work:

- **One level of detail per function.** A function that says "work out every late fee" should not also decide how to round a number. If it does both, it is two chapters.
- **Names do the explaining.** Functions are verbs (`calculate_fee`) and data are nouns (`LateFee`). If a name is good, you do not need to open the function to know what it does.

That leaves comments with one job: saying what the code cannot. I write no comment that repeats the next line. I do write this one, because no reader could guess it:

```python
# Our contracts count a month as 30 days, whatever the calendar says.
fee = invoice.amount * rules.monthly_rate * days_late / 30
```

## Values you can change without touching the code

In the first version, the numbers 14, 0.02 and 25 are in the logic. Changing a rate means finding the right line, editing code and hoping. But those numbers are not how the program works. They are terms in a contract, and someone who cannot program may be the one who knows them.

So they get their own file:

```yaml
# Read by lib/billing/fees.py: the terms in our contracts
grace_days: 14
monthly_rate: 0.02
minimum_fee: 25
```

My test for what goes there: could someone change it without changing how the code works? Rates, limits, thresholds, prompts and file locations go in config. The logic stays in code.

I use YAML, because comments and long text read well in it, and it is what I check with Pydantic in the next section. I have looked at Hydra and OmegaConf and do not use them for this. Hydra is built for experiments, and it takes over the command line, working directory and logging. OmegaConf adds merging and interpolation, which most programs never need.

## One folder structure, three times

Code, config and tests all use the same subfolders, and a file keeps its name in each:

![Searching for "fees" in an editor finds three files. Lined up, their paths share the same subfolder billing: fees.py under lib holds the code, fees.yaml under config holds the values, and test_fees.py under tests holds the tests](/images/blogs/python-mirror.svg)

This is the habit I would keep if I had to drop the rest. You do not need to learn the project first. Press Ctrl+P in your editor, type `fees`, and you have what the code does, what can be changed and what has been checked. Nobody has to remember where anything lives, because there is only one answer.

It also cannot drift, because a module finds its config file from its own name:

```python
RULES = config_for(__name__, FeeRules)  # latefees.lib.billing.fees reads config/billing/fees.yaml
```

The folders follow what the code does, not what kind of code it is. And they appear when there is code to put in them: an empty folder or a `utils.py` with one function in it is worse than no folder.

## Types, and checks at the door

A type on every function gives the reader the input and output without opening it. It also gives the tools something to check. Linters like Ruff catch sloppy code, and Mypy reads the types and catches mistakes that would otherwise wait until the code runs:

```text
error: Argument 1 to "find_late_fees" has incompatible type "Invoice"; expected "list[Invoice]"
```

Mypy cannot see inside a YAML or CSV file, though. Anything from outside the program is just text until something checks it. So I use two tools for two jobs.

**Pydantic where data comes in.** It checks config and input when they are read, so the rest of the program can trust them:

```python
class FeeRules(BaseModel):
    """The terms in our contracts."""

    model_config = ConfigDict(extra="forbid")

    grace_days: int = Field(ge=0)
    monthly_rate: Decimal = Field(gt=0, lt=1)
    minimum_fee: Decimal = Field(ge=0)
```

Now the config file has rules a person can read, and a mistake stops the program as it starts. Write a rate of 2 instead of 0.02:

```text
monthly_rate
  Input should be less than 1 [type=less_than, input_value=2, input_type=int]
```

Misspell `grace_days` and it names both the missing field and the unknown one. Without this, a wrong rate could go out on real invoices before anyone noticed. With it, the person who changed the file finds out at once, from a message that names the problem.

**Dataclasses inside.** Once data has passed the door, it does not need checking again, so a plain typed container will do:

```python
@dataclass(frozen=True)
class Invoice:
    """One invoice we have sent."""

    number: str
    customer: str
    amount: Decimal
    due: date
```

`frozen=True` means an invoice cannot change after it is made, which keeps the functions pure. Instead of `p[3]`, the code says `invoice.due`, and a reader knows it is a date. Pydantic can check dataclasses too, so one line at the edge turns every CSV row into an `Invoice` or stops with an error:

```python
TypeAdapter(list[Invoice]).validate_python(list(csv.DictReader(file)))
```

## Everything is one package

I always make the code an installable package, even for a small project, and everything imports from it the same way, with its full path:

```python
from latefees.lib.billing.fees import find_late_fees
```

The cli, the tests, a script and a notebook all use the same line. It tells a reader exactly which file to open. There are no relative dots to resolve, no `sys.path` changes at the top of a script, and no "works only if you run it from this folder".

The entry point sits at the top of the package, so it is the first thing you find, and it does nothing but hand over:

```text
latefees/
|-- pyproject.toml
|-- uv.lock
|-- src/latefees/
|   |-- cli.py                  the entry point: reads the command line and hands over
|   |-- lib/
|   |   |-- billing/
|   |   |   |-- fees.py         the rules for a late fee
|   |   |   `-- report.py       the whole program, in its last function
|   |   `-- shared/
|   |       `-- settings.py     reading config files
|   `-- config/
|       `-- billing/
|           `-- fees.yaml       the values you can change
`-- tests/
    `-- billing/
        |-- test_fees.py
        `-- test_report.py
```

[uv](https://docs.astral.sh/uv/) is what makes this painless. It installs the right Python version, creates the environment, installs the package and pins every dependency in a lock file. So the setup for a new colleague is one command, `uv sync`, and everything else starts with `uv run`. That matters more for the reader who does not live in Python: they have no virtual environments to learn before they can see the code run.

## Simple until proven otherwise

Readable code is also code that is not there. Three rules keep it small:

- **Write the boring version.** If there is one use case, a plain function beats a decorator factory or a class hierarchy.
- **Wait for the second real caller.** Three similar lines are not a problem. I extract a shared function when a second caller needs the same thing, because code that only looks alike often changes for different reasons.
- **No options for requirements nobody has.** If every caller passes the same value, the argument should not exist.

Each of these leaves a reader fewer things to wonder about.

## Tests you can read as a specification

Pure functions pay off here. There is nothing to set up, so a test is three lines, and its name says what the program promises:

```python
RULES = FeeRules(grace_days=14, monthly_rate=Decimal("0.02"), minimum_fee=Decimal("25"))
INVOICE = Invoice("4471", "Aurora", Decimal("12000"), date(2026, 9, 1))


def test_an_invoice_inside_the_grace_period_has_no_fee() -> None:
    assert find_late_fees([INVOICE], date(2026, 9, 15), RULES) == []


def test_a_small_invoice_still_pays_the_minimum() -> None:
    small = Invoice("4472", "Birch", Decimal("100"), date(2026, 9, 1))
    [late_fee] = find_late_fees([small], date(2026, 10, 1), RULES)
    assert late_fee.fee == Decimal("25.00")
```

Someone who has never seen the code can read the list of test names and learn the fee rules. The tests also pass in their own rules, so changing the YAML file does not break them.

I only mock what leaves the process: networks, the clock, the file system. If you need a mock to test your logic, that is usually a sign the logic has not been moved away from the edge yet.

## A new kind of reader

Coding agents have made this more useful, not less. An agent starts every task with no context, like a new colleague on their first day, and it reads what is on the page rather than what the team remembers. Searching for a file name finds the code, config and tests. A signature says what a function needs. A config check catches a wrong value at once. What helps the person with the least context helps it too.

## Try it

This starts the layout above:

```bash
uv init --package latefees
cd latefees
uv add pydantic pyyaml
uv add --dev mypy pytest ruff types-pyyaml
```

Then add the folders, and use these every day:

```bash
uv run ruff format .
uv run ruff check .
uv run mypy src
uv run pytest
```

Every snippet in this post comes from a small package that passes those four commands, apart from the first version and the class, which are there to be taken apart. For a larger codebase built the same way, see [agent-injection-tests](https://github.com/AndersHenriksen-dev/agent-injection-tests). There [audit.py](https://github.com/AndersHenriksen-dev/agent-injection-tests/blob/main/src/injectiontests/lib/existing_agents/audit.py), [audit.yaml](https://github.com/AndersHenriksen-dev/agent-injection-tests/blob/main/src/injectiontests/config/existing_agents/audit.yaml) and [test_audit.py](https://github.com/AndersHenriksen-dev/agent-injection-tests/blob/main/tests/existing_agents/test_audit.py) are the same three files, and my full [style guide](https://github.com/AndersHenriksen-dev/agent-injection-tests/blob/main/.claude/reference/python-style.md) is in the repository.

If you only take one thing from this: open a file you wrote last month and read the last function out loud. If a colleague from another department could follow it, the rest is detail.
