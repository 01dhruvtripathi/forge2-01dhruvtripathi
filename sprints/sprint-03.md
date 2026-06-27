# Sprint 03: SLA Breach Indicators

## Goal
Implement SLA (Service Level Agreement) breach indicators to show which tickets have exceeded their expected response/resolution times. This is a SHOULD tier requirement in the PulseDesk specification.

## Issues
- [x] Determine the SLA thresholds based on ticket priority (Critical: 2h, High: 8h, Medium: 48h, Low: 96h).
- [x] Update the React frontend `TicketCard.jsx` to dynamically calculate the time elapsed since `created_at`.
- [x] Display a prominent red "SLA Breached" badge if the threshold is exceeded for open/in_progress tickets.

## Outcome
- [x] Shipped: SLA breached indicator badge is successfully rendering on the dashboard ticket list for older, unresolved tickets.
- [ ] Slipped: None.
