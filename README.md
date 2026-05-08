Round Robin vs Shortest Job First
Operating Systems Course — Group 6
_______________________________________________________________________________________________

Project Overview

This project implements and compares two CPU scheduling algorithms:
Round Robin (RR) and Shortest Job First (SJF) Preemptive (SRTF).
The simulator runs entirely in the browser — no installation, no backend,
no dependencies. The user enters a set of processes, sets a time quantum,
and the simulator runs both algorithms on the same input and displays
the results side by side.
_______________________________________________________________________________________________

How to Run

Download or clone the repository
Open OS demo.html in any modern web browser
That's it — no setup required

_______________________________________________________________________________________________

Files

FilePurposeOS demo.htmlPage structure and layoutstyle.cssAll styling — light mode, dark mode, responsive layoutscript.jsAll logic — scheduling algorithms, Gantt chart, metrics, validation

_______________________________________________________________________________________________

Features

Add and remove processes dynamically (up to 8)
Configurable time quantum for Round Robin
Input validation with clear error messages
Round Robin scheduling with correct queue rotation and arrival handling
SJF Preemptive (SRTF) scheduling with shortest-burst selection and arrival tiebreaking
Gantt Chart with time axis for both algorithms
Metrics table per algorithm showing: AT, BT, CT, TAT, WT, RT
Average WT, TAT, and RT for each algorithm
Side-by-side comparison panel with visual bars
Light / Dark mode toggle (saved across sessions via localStorage)
Reset button restores default processes without page reload
Fully responsive on mobile screens


_______________________________________________________________________________________________

Metrics Calculated

MetricFormulaCT — Completion TimeWhen the process finishesTAT — Turnaround TimeCT − ATWT — Waiting TimeTAT − BTRT — Response TimeFirst execution start − AT

_______________________________________________________________________________________________

Algorithms

Round Robin - Preemptive

Each process gets at most q time units
If not finished, it goes to the back of the ready queue
Processes that arrive while another is running are enqueued in arrival order
CPU idle gap handled: jumps to next arriving process if queue is empty

SJF — Preemptive (SRTF)

Preemptive: if a new process arrives with a shorter remaining burst time
than the currently running process, the CPU is preempted immediately
At each decision point, selects the process with the smallest remaining burst time
Tiebreak: if two processes have equal remaining time, earliest arrival wins
CPU idle gap handled: jumps to next arriving process if none are available

_______________________________________________________________________________________________
Team — Group 6
- Ammar Ahmed    — Project Manager
- Ibrahim Hassan — Input & Validation
- Ali Mahmoud    — Round Robin
- Ahmed Ibrahim  — SJF
- Mohammed Emad  — Gantt Chart
- Ahmed Hassan   — Metrics
- Mohammed Bahy  — Comparison & Analysis

