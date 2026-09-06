# Sample report sources

The three demo reports offered for download on `/submit`. These HTML files are
the originals; `public/samples/*.pdf` is build output.

```bash
tools/sample-docs/build.sh      # re-renders all three PDFs
```

## Why they exist

The app grades one narrow kind of document. Without something to upload, a
visitor to the public demo cannot see it work at all.

They are also the reason the university's own documents are not published. The
official criteria PDF, the `.docx` with the worked example, and the risk
framework all live in `../../../documents/` — outside both repos — and carry
their authors' names in the file metadata, a staff member's personal mobile
number in the body text, and, in the framework, the university council by name.
They are the Risk Management Center's copyrighted material as well. Nothing from
them is reproduced here.

## What is in them

Everything is invented: the faculties and centres do not exist, and no order
number, date, figure, KRI or incident refers to anything real. Each file carries
a note saying so at the top and in the footer.

| File | Shape | What it exercises |
| --- | --- | --- |
| `sample-strong.html` | Written to reach the top level on every criterion | Four communication channels with a measured acknowledgement rate, an order number that also appoints coordinators in all six sub-units, risk duties written into job descriptions, four minuted meetings plus a standing item on the faculty board agenda, every risk mapped to the strategic objective it threatens, five identification tools including scenario analysis, expected-loss figures in baht with a three-year forecast, per-risk plans cascaded into 24 sub-unit plans, four quarters in Riskonnex plus a dashboard recomputing KRIs daily, six KRIs with three-tier thresholds marked leading or lagging, reporting shaped per stakeholder group and tied to budget allocation, per-risk outcomes including two that missed target, two incidents with a 14-entry near-miss register, five process improvements already made |
| `sample-partial.html` | Real work, incomplete evidence | Two of four risks unmapped, no flowchart, one combined plan with no timeframes, two of four quarters logged, KRIs for two risks only, results reported in aggregate, recognition by verbal thanks alone, improvements that are all still planned |
| `sample-weak.html` | A unit that has just started | No appointment order, no register, no plan, nothing in Riskonnex, no KRIs, no awareness activity — exercises how the UI reports criteria whose evidence cannot be found |

The spread is deliberate. Grading all three shows the total and the award tier
moving, which one document on its own cannot demonstrate.

Measured on `gemini-3.6-flash`: 95 (Excellence Award, every criterion at the top
level), 66 (Improvement Award) and 47.67 (Participation Certificate). 95 rather
than 100 is correct and documented — levels score at the midpoint of their
published band, so a flawless submission tops out there.

Passing all of a criterion's `checks` is not the same as reaching the top level:
an earlier draft of `sample-strong` satisfied every check and still scored 82.75,
because the level descriptors ask for things the checks do not — quantitative
analysis, forecasting, a real-time dashboard, a link into performance management.
Those are what the current draft adds. Keep that in mind before trimming it.

## Rendering notes

`build.sh` drives headless Chrome, the only HTML-to-PDF renderer already on a
mac that shapes Thai correctly. No web fonts are linked, so the build works
offline and falls back to the system Thai face. Chrome writes the PDF and then
does not exit here, so the script waits for the file to settle and stops it,
verifying `%%EOF` before reporting success.
