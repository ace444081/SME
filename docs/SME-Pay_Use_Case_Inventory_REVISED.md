# SME-Pay Revised Use-Case Inventory

**System title:** Design and Development of SME-Pay: A Web-Based Payroll Automation System for Visual Options Engineering and Fabrication Services  
**Document purpose:** Corrected use-case inventory for Chapter 3: Program Activity Using Use Case  
**Version:** 1.1 corrected  
**Generated:** 2026-05-15  
**Basis:** Corrected use-case inventory + analysis report issue-resolution pass

---

## 1. Correction Summary

This version resolves the inconsistencies found in the analysis report.

| Issue Area | Resolution Applied |
|---|---|
| Restore Backup had no UC code | Added **UC-17 Restore Backup** and placed it under **Should Include if Time Allows**. |
| Compute Net Pay was incorrectly modeled as `<<include>>` | Removed it from the include table. Net pay is an internal step of **UC-08 Compute Payroll**. |
| Submit Payroll for Review workflow gap | Added **UC-16 Submit Payroll for Review** as a core use case because Owner / Manager approval remains in scope. |
| Manage Company Information access mismatch | Payroll Administrator now has restricted access; System Administrator has full access. |
| Reopen Finalized Payroll Period had no scope classification | Added **UC-18 Reopen Finalized Payroll Period** under **Should Include if Time Allows**. |
| Dashboards lacked UC codes | Dashboards are now documented as UI/navigation views, not standalone use-case ovals. |
| Internal retrieval/audit behaviors were listed as `<<include>>` | Internal retrieval, validation, computation, and automatic audit logging are documented in specifications, not as diagram use cases. |
| View Payroll Computation Breakdown had no UC code | Treated as a required sub-function of **UC-09 Review Payroll Computation**, not a separate main diagram use case. |
| Change Own Password was missing from Section 4 and matrix | Added **UC-S01 Change Own Password** as a universal supporting use case. |

---

## 2. Modeling Rules Used

| Rule | Application in SME-Pay |
|---|---|
| Actors must interact with the system | Only human users are modeled as actors. |
| Use cases should represent user goals | Computation formulas, retrieval steps, validation checks, and automatic audit logging are not drawn as separate use-case ovals. |
| Broad use-case names are preferred | CRUD details are placed in the description or use-case specification. |
| `<<include>>` is used only for required user-visible sub-behavior | Avoids turning internal database/system behavior into diagram use cases. |
| `<<extend>>` is used for optional or conditional behavior | Corrections, returns, batch printing, exports, and reopening are conditional extensions. |
| Employee portal is optional | Employee use cases are placed in a separate optional section. |
| Dashboards are UI views | Payroll and management dashboards summarize data from existing use cases and are not standalone use cases. |

---

## 3. Actor List

### 3.1 Core Actors

| Actor | Description | Include in Main Diagram? |
|---|---|---|
| Payroll Administrator | Prepares payroll, manages employee records, encodes payroll inputs, computes payroll, submits payroll for review, and generates outputs. | Yes |
| Owner / Manager | Reviews payroll results, returns payroll for correction, approves/finalizes payroll, views reports, and checks audit logs. | Yes |
| System Administrator | Manages users, roles, company/system settings, audit logs, backup, restore, and technical maintenance. | Yes |

### 3.2 Optional Actor

| Actor | Description | Include in Main Diagram? |
|---|---|---|
| Employee | May view/download own payslip and submit payroll concerns if the employee portal is implemented. | Optional |

### 3.3 Not Modeled as Actors

| Item | Reason |
|---|---|
| Government Reference Sources | Passive references only. The system does not directly integrate with SSS, PhilHealth, Pag-IBIG, or BIR. |
| Printer / PDF Export | Output method, not a human/external system actor. |
| Backup Storage | Storage destination, not a user that initiates a use case. |
| Database | Internal system component, not an actor. |
| Email Service | Out of scope unless email delivery is later implemented. |

---

# 4. Recommended Core Use Cases for the Chapter 3 Diagram

Use this list for the main use-case diagram if the prototype is admin/owner-focused and the employee portal is not included.

| Code | Use Case | Main Actor(s) | Description |
|---|---|---|---|
| UC-01 | Log In / Log Out | Payroll Administrator, Owner / Manager, System Administrator | Allows authorized users to access and exit the system. |
| UC-02 | Manage User Accounts and Roles | System Administrator | Create, update, deactivate users, reset passwords, and assign roles. |
| UC-03 | Manage Company Information | System Administrator, Payroll Administrator | Configure company details shown on payslips and reports. Payroll Administrator access is limited to basic display details. |
| UC-04 | Manage Employee Records | Payroll Administrator | Add, view, edit, search, and deactivate employee records. |
| UC-05 | Manage Payroll Periods and Cut-off Dates | Payroll Administrator | Create and manage payroll periods, start dates, end dates, cut-off dates, and pay dates. |
| UC-06 | Encode Attendance / Payroll Inputs | Payroll Administrator | Encode days worked, absences, late minutes, undertime, overtime, and manual payroll inputs. |
| UC-07 | Manage Deduction Settings | Payroll Administrator, System Administrator | Maintain configurable deduction references for SSS, PhilHealth, Pag-IBIG, withholding tax, and other deductions. |
| UC-08 | Compute Payroll | Payroll Administrator | Compute gross pay, attendance adjustments, overtime, deductions, employer contributions, and net pay. |
| UC-09 | Review Payroll Computation | Payroll Administrator, Owner / Manager | Review employee payroll results and computation breakdown before submission or finalization. |
| UC-10 | Approve / Finalize Payroll | Owner / Manager | Approve payroll and lock the payroll period after review. |
| UC-11 | Generate Payslips | Payroll Administrator | Generate printable or downloadable payslips from finalized or approved payroll records. |
| UC-12 | Generate Payroll Summary Reports | Payroll Administrator, Owner / Manager | Generate payroll summaries by payroll period. |
| UC-13 | View Payroll History | Payroll Administrator, Owner / Manager | Retrieve and review previous payroll periods, payroll runs, and generated records. |
| UC-14 | Export / Backup Records | Payroll Administrator, System Administrator | Export reports, payslips, payroll data, audit logs, and backup files. |
| UC-15 | View Audit Logs | Owner / Manager, System Administrator | Review system activity such as payroll updates, user changes, login attempts, and deduction setting changes. |
| UC-16 | Submit Payroll for Review | Payroll Administrator | Send a computed payroll period to Owner / Manager for review and approval. |
| UC-17 | Restore Backup | System Administrator | Restore system data from a previously created backup file. |
| UC-18 | Reopen Finalized Payroll Period | Owner / Manager, System Administrator | Reopen a finalized payroll period for authorized correction. |

## 4.1 Supporting System Use Cases

Supporting use cases may be shown in a smaller secondary diagram or listed in the use-case specification. They do not need to dominate the main business-process diagram.

| Code | Use Case | Actor(s) | Description |
|---|---|---|---|
| UC-S01 | Change Own Password | All authenticated users | Allows a logged-in user to update their own password. |
| UC-S02 | Reset User Password | System Administrator | Allows a System Administrator to reset another user's password. |
| UC-S03 | View Dashboard | Payroll Administrator, Owner / Manager, System Administrator | Dashboard/navigation view that summarizes records from existing modules. Not a standalone business use case. |

## 4.2 UC-09 Required Sub-Functions

**UC-09 Review Payroll Computation** includes the following required visible sub-functions:

| Sub-Function | Description |
|---|---|
| View Payroll Computation Breakdown | Shows basic pay, overtime, attendance deductions, statutory deductions, manual adjustments, employer-side contributions, and net pay. |
| View Employee Payroll Result | Shows one employee's computed payroll result. |
| View Payroll Run Status | Shows whether a payroll run is computed, submitted, returned, finalized, or voided. |
| View Warnings / Error Messages | Shows incomplete records, missing inputs, or computation issues before finalization. |

These are documented as sub-functions of UC-09, not as separate use-case ovals.

## 4.3 Optional Employee Portal Add-On

Add these only if the employee portal is implemented.

| Code | Use Case | Main Actor | Description |
|---|---|---|---|
| UC-E01 | View Own Payslip | Employee | Employee views own payslip only. |
| UC-E02 | Download / Print Own Payslip | Employee | Employee downloads or prints own payslip. |
| UC-E03 | View Own Payroll History | Employee | Employee views previous own payslips. |
| UC-E04 | View Own Attendance Summary Used for Payroll | Employee | Employee views attendance inputs used in payroll computation, if allowed. |
| UC-E05 | Submit Payslip Concern | Employee | Employee reports a possible payroll or payslip concern. |
| UC-E06 | Request Profile Correction | Employee | Employee submits a correction request for own profile data. |

---

# 5. Payroll Administrator Use Cases

## 5.1 Main Use Cases

| Code | Use Case | Notes |
|---|---|---|
| PA-M-01 | Log In / Log Out | Required access control. |
| PA-M-02 | View Payroll Dashboard | UI/navigation view only; not a separate main diagram use case. |
| PA-M-03 | Manage Employee Records | Includes add, view, edit, search, and deactivate. |
| PA-M-04 | Manage Employee Salary / Rate Information | Maintains rate history and effective dates. |
| PA-M-05 | Manage Employee Government ID Fields | Includes SSS, PhilHealth, Pag-IBIG, and TIN records. |
| PA-M-06 | Manage Payroll Periods and Cut-off Dates | Creates payroll period and defines coverage/cut-off. |
| PA-M-07 | Encode Attendance / Payroll Inputs | Includes days worked, absences, late minutes, undertime, and overtime hours. |
| PA-M-08 | Manage Deduction Settings | Updates deduction references and other deduction settings if authorized. |
| PA-M-09 | Compute Payroll | Single consolidated computation use case. |
| PA-M-10 | Review Payroll Computation Breakdown | Sub-function of UC-09. |
| PA-M-11 | Submit Payroll for Review | Core because Owner / Manager approval is retained. |
| PA-M-12 | Generate Payslips | Generate individual or selected payslips. |
| PA-M-13 | Generate Payroll Summary Reports | Generate summary by payroll period. |
| PA-M-14 | View Payroll History | Retrieve previous payroll records. |
| PA-M-15 | Export Payroll Reports and Payslips | PDF, CSV, Excel, or printable output. |
| PA-M-16 | Backup Payroll Records | Export records for safekeeping. |
| PA-M-17 | Change Own Password | Supporting system use case. |

## 5.2 Potential Use Cases

| Code | Use Case | Notes |
|---|---|---|
| PA-P-01 | Import Employee List from Spreadsheet | Optional setup accelerator. |
| PA-P-02 | Import Attendance Records from Spreadsheet | Optional encoding accelerator. |
| PA-P-03 | Bulk Encode Attendance Inputs | Useful if many employees exist. |
| PA-P-04 | Bulk Update Employee Rates | Useful after salary changes. |
| PA-P-05 | Duplicate Previous Payroll Period Setup | Speeds repeated payroll cycles. |
| PA-P-06 | Add Manual Allowance | Optional if allowances are included. |
| PA-P-07 | Add Manual Deduction | Optional if custom deductions are included. |
| PA-P-08 | Add Payroll Adjustment Remarks | Useful for audit and explanation. |
| PA-P-09 | Attach Supporting Payroll Document | Optional documentation feature. |
| PA-P-10 | Generate Deduction Summary Report | Useful for manual remittance preparation. |
| PA-P-11 | Generate Employee Payroll History Report | Useful for employee-specific review. |
| PA-P-12 | Generate Printable Payroll Register | Useful for offline review/signature. |
| PA-P-13 | Filter Reports by Employee | Report refinement. |
| PA-P-14 | Filter Reports by Date Range | Report refinement. |
| PA-P-15 | Filter Reports by Payroll Period | Report refinement. |
| PA-P-16 | Batch Print Payslips | Useful for payroll release. |
| PA-P-17 | Mark Payslip as Released | Optional tracking feature. |
| PA-P-18 | Add Payroll Notes | For internal notes. |
| PA-P-19 | Set Default Payroll Frequency | System configuration. |
| PA-P-20 | Set Default Working Days | System configuration. |
| PA-P-21 | Set Default Working Hours per Day | System configuration. |
| PA-P-22 | Generate List of Incomplete Employee Records | Useful before payroll computation. |
| PA-P-23 | Archive Old Payroll Periods | Optional maintenance feature. |
| PA-P-24 | Restore Archived Payroll Period | Optional recovery feature. |
| PA-P-25 | Receive Payroll Concern | Only if employee concern workflow exists. |

## 5.3 Situational Use Cases

| Code | Situation | Use Case |
|---|---|---|
| PA-S-01 | New employee is hired | Add Employee Record |
| PA-S-02 | Employee resigns | Deactivate Employee Record |
| PA-S-03 | Employee salary changes | Update Employee Salary / Rate |
| PA-S-04 | Employee position changes | Update Employment Details |
| PA-S-05 | Employee government ID is missing | Flag Employee Record as Incomplete |
| PA-S-06 | Employee government ID is corrected | Update Government ID Field |
| PA-S-07 | Attendance input is wrong | Correct Attendance / Payroll Input |
| PA-S-08 | Late minutes were encoded incorrectly | Edit Late-Minute Entry |
| PA-S-09 | Overtime was missed | Add Overtime Entry |
| PA-S-10 | Absence was encoded incorrectly | Edit Absence Entry |
| PA-S-11 | Deduction setting is outdated | Update Deduction Settings |
| PA-S-12 | Payroll computation is incorrect | Recompute Payroll After Correction |
| PA-S-13 | Payroll is returned by manager | Revise Payroll Draft |
| PA-S-14 | Payslip has wrong amount | Regenerate Payslip After Correction |
| PA-S-15 | Employee requests old payslip | Retrieve Previous Payslip |
| PA-S-16 | Payroll report is needed for filing | Export Payroll Summary |
| PA-S-17 | Printer is unavailable | Export PDF Instead |
| PA-S-18 | Internet connection fails while encoding | Save Draft and Resume Later |
| PA-S-19 | Payroll period was created with wrong date | Edit Open Payroll Period |
| PA-S-20 | Finalized payroll has error | Request Payroll Reopening or Adjustment |
| PA-S-21 | Unauthorized record change is suspected | Request Audit Log Review |
| PA-S-22 | Data needs backup before update | Export Payroll Data |
| PA-S-23 | Employee disputes deduction | Review Deduction Breakdown |
| PA-S-24 | Employee disputes overtime | Review Attendance and Overtime Input |
| PA-S-25 | Business changes payroll frequency | Update Payroll Period Setup |

---

# 6. Owner / Manager Use Cases

## 6.1 Main Use Cases

| Code | Use Case | Notes |
|---|---|---|
| OM-M-01 | Log In / Log Out | Required access control. |
| OM-M-02 | View Management Dashboard | UI/navigation view only; not a separate main diagram use case. |
| OM-M-03 | View Employee List | View only unless given edit authority. |
| OM-M-04 | View Payroll Period | Check current and previous payroll periods. |
| OM-M-05 | Review Payroll Computation | Includes gross pay, deduction, and net pay review. |
| OM-M-06 | View Payroll Computation Breakdown | Sub-function of UC-09. |
| OM-M-07 | Return Payroll for Correction | If computation needs revision. |
| OM-M-08 | Approve / Finalize Payroll | Lock payroll period after checking. |
| OM-M-09 | View / Generate Payroll Summary Report | Combined view and generation action. |
| OM-M-10 | Export / Print Payroll Summary Report | For documentation and management review. |
| OM-M-11 | View Payroll History | Retrieve old payroll records. |
| OM-M-12 | View Audit Logs | Review important system actions. |
| OM-M-13 | Change Own Password | Supporting system use case. |

## 6.2 Potential Use Cases

| Code | Use Case | Notes |
|---|---|---|
| OM-P-01 | Compare Payroll Periods | Compare current and previous payroll cost. |
| OM-P-02 | View Payroll Cost Trend | Optional dashboard/report feature. |
| OM-P-03 | View Employee Payroll History | Employee-specific review. |
| OM-P-04 | View Deduction Summary | Useful for payroll review. |
| OM-P-05 | View Total Employer-Side Contribution Estimate | If employer-side contributions are included. |
| OM-P-06 | Approve Payroll Adjustment | Useful if correction workflow exists. |
| OM-P-07 | Approve Payroll Reopening | Needed if finalized payroll can be reopened. |
| OM-P-08 | Add Management Remarks | Internal notes. |
| OM-P-09 | View Inactive Employee Records | Useful for resigned employees. |
| OM-P-10 | View Incomplete Employee Records | Helps before payroll finalization. |
| OM-P-11 | View Pending Payroll Periods | Management dashboard refinement. |
| OM-P-12 | View Finalized Payroll Periods | Management dashboard refinement. |
| OM-P-13 | Receive Payroll Review Notification | Optional notification feature. |
| OM-P-14 | Receive Missing Payroll Input Warning | Optional notification feature. |
| OM-P-15 | View Employees with High Overtime | Optional monitoring feature. |
| OM-P-16 | Download Archived Payroll Records | Optional archive feature. |

## 6.3 Situational Use Cases

| Code | Situation | Use Case |
|---|---|---|
| OM-S-01 | Payroll amount looks unusually high | Review Payroll Computation Breakdown |
| OM-S-02 | Payroll amount looks unusually low | Review Missing Inputs |
| OM-S-03 | Employee complains about pay | Review Employee Payroll Record |
| OM-S-04 | Payroll admin submits draft | Review Payroll Draft |
| OM-S-05 | Payroll draft has errors | Return Payroll for Correction |
| OM-S-06 | Payroll draft is correct | Approve Payroll |
| OM-S-07 | Payroll must be locked | Finalize Payroll Period |
| OM-S-08 | Finalized payroll has error | Approve Payroll Reopening or Adjustment |
| OM-S-09 | Unauthorized change is suspected | View Audit Logs |
| OM-S-10 | Old payroll data is needed | Retrieve Payroll History |
| OM-S-11 | Business needs payroll report | Export Payroll Summary |
| OM-S-12 | Deduction references changed | Instruct Admin to Update Deduction Settings |
| OM-S-13 | Employee is terminated | Review Final Payroll Record |
| OM-S-14 | Salary increase is approved | Review Updated Employee Rate |
| OM-S-15 | Payroll records are requested | Print or Export Payroll Records |
| OM-S-16 | User access concern occurs | Request Role or Account Review |
| OM-S-17 | System backup is needed | Request Backup / Export |
| OM-S-18 | Payroll period has no records | Check Payroll Period Status |
| OM-S-19 | Excessive overtime is noticed | Review Overtime Entries |
| OM-S-20 | Audit trail is required | Generate Audit Log Report |

---

# 7. System Administrator Use Cases

## 7.1 Main Use Cases

| Code | Use Case | Notes |
|---|---|---|
| SA-M-01 | Log In / Log Out | Required access control. |
| SA-M-02 | Manage User Accounts | Create, view, edit, and deactivate users. |
| SA-M-03 | Assign User Roles and Permissions | Defines module access. |
| SA-M-04 | Reset User Password | For locked-out users. |
| SA-M-05 | Manage Company Information | Full company and system-level access. |
| SA-M-06 | Manage System Settings | Default payroll settings and app configuration. |
| SA-M-07 | Manage Deduction Settings | Technical/admin support for deduction tables. |
| SA-M-08 | View Audit Logs | Monitor important actions. |
| SA-M-09 | Export Audit Logs | For investigation/documentation. |
| SA-M-10 | Backup System Data | Protect records from loss. |
| SA-M-11 | Restore System Backup | Needed if backup exists. |
| SA-M-12 | Monitor System Errors | Review operational issues. |
| SA-M-13 | Change Own Password | Supporting system use case. |

## 7.2 Potential Use Cases

| Code | Use Case | Notes |
|---|---|---|
| SA-P-01 | Configure Backup Schedule | Optional automation. |
| SA-P-02 | Configure Password Rules | Security policy. |
| SA-P-03 | Configure Session Timeout | Security policy. |
| SA-P-04 | Configure Default Payroll Frequency | System setup. |
| SA-P-05 | Configure Default Working Hours | System setup. |
| SA-P-06 | Configure Audit Log Retention | System maintenance. |
| SA-P-07 | Configure Payslip Template | Output customization. |
| SA-P-08 | Configure Report Template | Output customization. |
| SA-P-09 | Manage Application Environment Settings | Developer/technical concern. |
| SA-P-10 | Manage Database Connection Settings | Developer/technical concern. |
| SA-P-11 | Manage Storage Settings | Developer/technical concern. |
| SA-P-12 | Archive Old Records | Maintenance. |
| SA-P-13 | Restore Archived Records | Maintenance/recovery. |
| SA-P-14 | View Failed Login Attempts | Security monitoring. |
| SA-P-15 | Lock Suspicious Account | Security response. |
| SA-P-16 | Unlock User Account | Account support. |
| SA-P-17 | Generate System Maintenance Report | Documentation. |
| SA-P-18 | Test Database Connection | Technical check. |
| SA-P-19 | Test Report Export Function | Technical check. |
| SA-P-20 | Test Backup Function | Technical check. |
| SA-P-21 | Apply Minor System Update | Maintenance. |
| SA-P-22 | Validate Deduction Table Setup | Prevent computation errors. |
| SA-P-23 | Import Deduction Reference Table | Optional table import feature. |
| SA-P-24 | Export System Configuration | Backup/configuration management. |

## 7.3 Situational Use Cases

| Code | Situation | Use Case |
|---|---|---|
| SA-S-01 | New payroll admin is assigned | Create User Account |
| SA-S-02 | User leaves business | Deactivate User Account |
| SA-S-03 | User forgets password | Reset User Password |
| SA-S-04 | User has wrong access level | Update Role / Permissions |
| SA-S-05 | Employee accidentally has admin access | Correct Role Assignment |
| SA-S-06 | Suspicious login occurs | Review Failed Login Attempts |
| SA-S-07 | Unauthorized access suspected | View Audit Logs |
| SA-S-08 | Payroll data changed unexpectedly | Trace Audit Log |
| SA-S-09 | System error occurs | Monitor System Error |
| SA-S-10 | Database backup is needed | Backup System Data |
| SA-S-11 | Data loss occurs | Restore System Backup |
| SA-S-12 | Deduction settings are outdated | Update Deduction Settings |
| SA-S-13 | Report export fails | Test Report Export Function |
| SA-S-14 | User account is locked | Unlock User Account |
| SA-S-15 | System is slow | Check System / Database Activity |
| SA-S-16 | Storage is almost full | Archive Old Records |
| SA-S-17 | New version is deployed | Apply System Update |
| SA-S-18 | Before system update | Create Backup |
| SA-S-19 | After system update | Verify System Functions |
| SA-S-20 | Audit report is requested | Export Audit Log Report |
| SA-S-21 | Payroll formula needs correction | Update Formula / Settings with Approval |
| SA-S-22 | System configuration is wrong | Update System Settings |
| SA-S-23 | Backup file is corrupted | Generate New Backup |
| SA-S-24 | User reports bug | Investigate System Error |
| SA-S-25 | Security review is needed | Review Access Roles and Logs |

---

# 8. Optional Employee Portal Use Cases

Include this actor only if employee self-service is approved and feasible.

## 8.1 Main Use Cases if Employee Portal Is Included

| Code | Use Case | Notes |
|---|---|---|
| EMP-M-01 | Log In / Log Out | Employee account access. |
| EMP-M-02 | View Own Profile | Employee can view only own basic information. |
| EMP-M-03 | View Own Payslip for Selected Payroll Period | Consolidates payslip viewing and period selection. |
| EMP-M-04 | Download / Print Own Payslip | Employee output function. |
| EMP-M-05 | View Own Payroll History | Previous own payslips only. |
| EMP-M-06 | View Own Attendance Summary Used for Payroll | Include only if attendance visibility is allowed. |
| EMP-M-07 | Submit Payslip Concern | Include only if concern workflow is implemented. |
| EMP-M-08 | Change Own Password | Supporting system use case. |

## 8.2 Potential Use Cases

| Code | Use Case | Notes |
|---|---|---|
| EMP-P-01 | Request Profile Correction | Sends correction request to admin. |
| EMP-P-02 | Request Contact Information Update | Optional employee request. |
| EMP-P-03 | View Deduction Breakdown | Useful for transparency. |
| EMP-P-04 | View Overtime Summary Used for Payroll | If overtime is visible. |
| EMP-P-05 | Download Multiple Payslips | Optional convenience. |
| EMP-P-06 | Receive Payslip Release Notification | Optional notification. |
| EMP-P-07 | Acknowledge Payslip Receipt | Optional tracking. |
| EMP-P-08 | Submit Missing Attendance Concern | Optional concern workflow. |
| EMP-P-09 | Submit Overtime Concern | Optional concern workflow. |
| EMP-P-10 | Submit Deduction Concern | Optional concern workflow. |
| EMP-P-11 | Request Password Reset | Optional self-service recovery. |
| EMP-P-12 | View Payroll Calendar | Optional information feature. |
| EMP-P-13 | View Employment Details | If allowed by business. |
| EMP-P-14 | Download Payroll Summary Certificate | Optional document request feature. |

## 8.3 Situational Use Cases

| Code | Situation | Use Case |
|---|---|---|
| EMP-S-01 | Employee needs latest payslip | View Own Payslip |
| EMP-S-02 | Employee needs printed copy | Print Own Payslip |
| EMP-S-03 | Employee needs digital copy | Download Own Payslip |
| EMP-S-04 | Employee forgot password | Request Password Reset |
| EMP-S-05 | Employee sees wrong net pay | Submit Payslip Concern |
| EMP-S-06 | Employee sees wrong deduction | Submit Deduction Concern |
| EMP-S-07 | Employee sees missing overtime | Submit Overtime Concern |
| EMP-S-08 | Employee sees wrong attendance | Submit Attendance Concern |
| EMP-S-09 | Employee changed contact details | Request Profile Update |
| EMP-S-10 | Employee cannot access account | Report Login Issue |
| EMP-S-11 | Payslip is not available yet | View No Payslip Available Message |
| EMP-S-12 | Employee wants old payslip | View Previous Payroll Period |
| EMP-S-13 | Employee resigns | View Final Payslip, if account remains active |
| EMP-S-14 | Employee tries to access another payslip | System Blocks Unauthorized Access |
| EMP-S-15 | Employee wants deduction explanation | View Deduction Breakdown |
| EMP-S-16 | Employee password may be compromised | Change Password |
| EMP-S-17 | Employee needs payroll proof | Download Payslip or Payroll Summary |
| EMP-S-18 | Payroll concern was resolved | View Corrected Payslip |
| EMP-S-19 | Payroll concern was rejected | View Admin Response or Explanation |

---

# 9. Reclassified or Removed Use Cases

## 9.1 Removed as Actors

| Previous Item | New Treatment |
|---|---|
| Government Reference Sources | Reference only; deduction updates are handled by Payroll Administrator/System Administrator. |
| Printer / PDF Export | Output method inside Generate/Export use cases. |
| Backup Storage | Destination inside Backup/Restore use cases. |
| Database | Internal component. |

## 9.2 Collapsed Internal Steps

| Previous Separate Use Cases | New Treatment |
|---|---|
| Compute gross pay, compute deductions, compute net pay | Internal steps of UC-08 Compute Payroll. |
| Encode days worked, encode absences, encode late minutes, encode overtime hours | Internal fields/processes of UC-06 Encode Attendance / Payroll Inputs. |
| View payroll summary report, generate payroll summary report | UC-12 Generate Payroll Summary Reports. |
| View own payslip, select payroll period | UC-E01 View Own Payslip. |
| Retrieve employee salary/rate, retrieve attendance inputs, apply deduction settings | Internal system retrieval/validation steps inside UC-08. |
| Record audit log | Automatic system behavior documented in use-case specifications, not a separate use case. |

## 9.3 Reclassified

| Use Case | Correct Classification |
|---|---|
| View Payroll Dashboard | UI/navigation view only. |
| View Management Dashboard | UI/navigation view only. |
| View Payroll Computation Breakdown | Required sub-function of UC-09. |
| Change Own Password | Supporting system use case UC-S01. |
| Recompute Payroll | Situational extension after correction. |
| Submit Payroll for Review | Core, because approval workflow is retained. |
| Reopen Finalized Payroll Period | Should include if time allows. |
| Employee Self-Service Portal | Optional / future enhancement. |
| Notifications | Optional unless notification module is implemented. |

---

# 10. Use-Case Relationships

## 10.1 Include Relationships

Use `<<include>>` only when the included behavior is required and visible enough to be useful in the use-case specification.

| Base Use Case | Relationship | Included Behavior | Reason |
|---|---|---|---|
| Review Payroll Computation | `<<include>>` | View Payroll Computation Breakdown | Review requires visible breakdown of earnings, deductions, and net pay. |
| Generate Payslips | `<<include>>` | Select Payroll Period / Payroll Run | Payslip generation must be based on a computed payroll record. |
| Generate Payroll Summary Reports | `<<include>>` | Select Payroll Period | Report must be based on a selected period. |

### Internal Behaviors Not Drawn as Include Ovals

The following are internal system behaviors and should be documented inside use-case specifications or flowcharts, not as separate use-case diagram ovals:

- Retrieve employee salary/rate.
- Retrieve attendance/payroll inputs.
- Apply deduction settings.
- Compute gross pay.
- Compute deductions.
- Compute net pay.
- Record audit log automatically.
- Validate required employee data.
- Validate deduction reference tables.

## 10.2 Extend Relationships

Use `<<extend>>` when behavior is optional, conditional, or exception-based.

| Base Use Case | Relationship | Extending Use Case | Condition |
|---|---|---|---|
| Review Payroll Computation | `<<extend>>` | Recompute Payroll After Correction | Error is found. |
| Review Payroll Computation | `<<extend>>` | Return Payroll for Correction | Owner / Manager rejects submitted payroll. |
| Approve / Finalize Payroll | `<<extend>>` | Reopen Finalized Payroll Period | Finalized payroll has an approved correction. |
| Generate Payslips | `<<extend>>` | Batch Print Payslips | User chooses batch printing. |
| Generate Payroll Summary Reports | `<<extend>>` | Export Report as PDF/CSV/Excel | User chooses export. |
| Manage Employee Records | `<<extend>>` | Flag Incomplete Employee Record | Required employee data is missing. |
| Log In | `<<extend>>` | Reset Password | User cannot access account. |
| View Payroll History | `<<extend>>` | Restore Archived Payroll Period | Archived record must be accessed. |
| View Own Payslip | `<<extend>>` | Submit Payslip Concern | Employee portal exists and employee disputes payslip. |

---

# 11. Access-Control Matrix

| Use Case / Module | Payroll Admin | Owner / Manager | System Admin | Employee Optional |
|---|---:|---:|---:|---:|
| Log In / Log Out | Yes | Yes | Yes | Yes |
| Change Own Password | Yes | Yes | Yes | Yes |
| Manage User Accounts and Roles | No | View only / optional | Yes | No |
| Manage Company Information | Yes, basic display details only | View only | Yes, full access | No |
| Manage Employee Records | Yes | View only / optional | Optional | Own profile only |
| Manage Payroll Periods | Yes | View only | Optional | No |
| Encode Attendance / Payroll Inputs | Yes | No | No | No |
| Manage Deduction Settings | Yes | View only | Yes | No |
| Compute Payroll | Yes | No | No | No |
| Review Payroll Computation | Yes | Yes | No | No |
| View Payroll Computation Breakdown | Yes | Yes | No | Own only, if portal exists |
| Submit Payroll for Review | Yes | No | No | No |
| Return Payroll for Correction | No | Yes | No | No |
| Approve / Finalize Payroll | No / optional | Yes | No | No |
| Reopen Finalized Payroll Period | Request only | Yes | Yes | No |
| Generate Payslips | Yes | Optional | No | Own only |
| Generate Payroll Summary Reports | Yes | Yes | No | No |
| View Payroll History | Yes | Yes | No | Own only |
| Export / Backup Records | Yes | Optional | Yes | Own payslip only |
| Restore Backup | No | No | Yes | No |
| View Audit Logs | No / limited | Yes | Yes | No |
| Restore Archived Records | No | Optional | Yes | No |

---

# 12. Scope Decision

## 12.1 Must Include in Prototype

| Use Case | Reason |
|---|---|
| Log In / Log Out | Security requirement. |
| Manage Employee Records | Core payroll data. |
| Manage Payroll Periods and Cut-off Dates | Required for payroll organization. |
| Encode Attendance / Payroll Inputs | Required for computation. |
| Manage Deduction Settings | Required because deduction references can change. |
| Compute Payroll | Main system purpose. |
| Review Payroll Computation | Needed before final output. |
| Submit Payroll for Review | Required because Owner / Manager approval is retained. |
| Approve / Finalize Payroll | Required control point for locked payroll. |
| Generate Payslips | Main output. |
| Generate Payroll Summary Reports | Management output. |
| View Payroll History | Record retrieval. |
| Export / Backup Records | Practical maintenance. |
| View Audit Logs | Security and accountability. |
| Change Own Password | Basic account security support. |

## 12.2 Should Include if Time Allows

| Use Case | Reason |
|---|---|
| UC-17 Restore Backup | Completes the backup/restore maintenance cycle. |
| UC-18 Reopen Finalized Payroll Period | Useful for authorized correction after finalization. |
| Manage User Accounts and Roles | Important if multiple users will be tested. |
| Manage Company Information | Improves payslip/report quality. |
| Batch Print Payslips | Useful but not required. |
| Generate Deduction Summary | Useful for payroll review and manual remittance preparation. |
| Configure Payslip Template | Useful customization but not core. |
| Configure Report Template | Useful customization but not core. |

## 12.3 Optional / Future Enhancement

| Use Case | Reason |
|---|---|
| Employee Portal | Adds development work; not required for admin-based prototype. |
| Submit Payslip Concern | Requires employee portal or concern workflow module. |
| Email Payslips | Requires email integration. |
| Notifications | Requires notification module. |
| Spreadsheet Import | Useful but not necessary for core demonstration. |
| Payroll Cost Trend / Analytics | Management enhancement. |
| Employee Profile Correction Requests | Requires employee portal. |
| Payroll Calendar | Optional self-service information feature. |

## 12.4 Out of Scope

| Use Case / Feature | Reason |
|---|---|
| Bank Salary Transfer | Requires bank integration and higher financial security controls. |
| Official SSS / PhilHealth / Pag-IBIG Remittance Filing | SME-Pay is internal payroll preparation only. |
| BIR e-Filing | Outside payroll preparation scope. |
| Biometric Timekeeping Integration | Requires hardware/device integration. |
| Full Accounting System Integration | SME-Pay is not a complete accounting system. |
| Full HRIS | Recruitment, training, appraisal, and leave management are outside scope. |
| Native Mobile App | Responsive web access is sufficient. |

---

# 13. Recommended Diagram Versions

## Version A: Core Prototype Diagram

Use this if the system will be admin/owner-focused.

**Actors:**

- Payroll Administrator
- Owner / Manager
- System Administrator

**Use cases:**

- Log In / Log Out
- Manage User Accounts and Roles
- Manage Company Information
- Manage Employee Records
- Manage Payroll Periods and Cut-off Dates
- Encode Attendance / Payroll Inputs
- Manage Deduction Settings
- Compute Payroll
- Review Payroll Computation
- Submit Payroll for Review
- Approve / Finalize Payroll
- Generate Payslips
- Generate Payroll Summary Reports
- View Payroll History
- Export / Backup Records
- Restore Backup
- View Audit Logs
- Reopen Finalized Payroll Period

**Do not draw as separate ovals in the main diagram:**

- View Payroll Dashboard
- View Management Dashboard
- Compute Gross Pay
- Compute Deductions
- Compute Net Pay
- Retrieve Employee Salary / Rate
- Retrieve Attendance Inputs
- Apply Deduction Settings
- Record Audit Log

## Version B: Extended Prototype Diagram

Use this only if employee portal is implemented.

**Additional actor:**

- Employee

**Additional use cases:**

- View Own Payslip
- Download / Print Own Payslip
- View Own Payroll History
- View Own Attendance Summary Used for Payroll
- Submit Payslip Concern
- Request Profile Correction

---

# 14. Main Payroll Workflow

```text
Payroll Administrator logs in
→ Manages employee records and rates
→ Creates payroll period and cut-off dates
→ Encodes attendance/payroll inputs
→ Updates deduction settings if needed
→ Computes payroll
→ Reviews computation breakdown
→ Submits payroll for review
→ Owner / Manager reviews payroll
→ Owner / Manager returns for correction OR approves/finalizes payroll
→ Payroll Administrator generates payslips and reports
→ System records audit logs and preserves payroll history
```

## 14.1 Correction Workflow

```text
Error found before finalization
→ Payroll is returned for correction
→ Payroll Administrator corrects input/rate/deduction setting
→ Payroll Administrator recomputes payroll
→ Payroll Administrator resubmits payroll for review
```

## 14.2 Reopening Workflow

```text
Error found after finalization
→ Payroll Administrator requests reopening
→ Owner / Manager or System Administrator authorizes reopening
→ System changes payroll period status to REOPENED
→ Correction and recomputation are performed
→ Payroll is reviewed and finalized again
```

---

# 15. Glossary

| Term | Meaning |
|---|---|
| Payroll Period | Date range covered by a payroll computation. |
| Cut-off Date | Last date included in a payroll period for attendance and payroll inputs. |
| Basic Pay | Pay based on regular workdays or salary rate before adjustments. |
| Gross Pay | Earnings before deductions. |
| Attendance Adjustment | Payroll increase or decrease based on attendance, absence, late minutes, undertime, or overtime. |
| Deduction Settings | Configurable values or tables for SSS, PhilHealth, Pag-IBIG, withholding tax, and other deductions. |
| Total Deductions | Sum of employee-side deductions. |
| Employer Contribution | Employer-side statutory contribution that does not reduce employee net pay. |
| Net Pay | Gross pay minus employee-side deductions. |
| Payslip | Individual payroll document showing earnings, deductions, and net pay. |
| Payroll Summary Report | Management report showing payroll totals for a selected period. |
| Audit Log | Record of important system actions, including user, action, timestamp, and affected record. |
| Finalized Payroll | Payroll record locked after review or approval. |
| Reopened Payroll | Previously finalized payroll reopened for authorized correction. |
| Dashboard | UI summary page that displays information from existing modules. |

---

# 16. Chapter 3 Writing Notes

1. Use **Version A** for the main use-case diagram unless the employee portal is definitely part of the prototype.
2. Keep employee portal use cases in a separate optional/future enhancement subsection.
3. Do not draw government agencies as actors unless the system directly connects to them through an integration.
4. Do not draw printer, PDF export, backup storage, database, or report engine as main actors.
5. Keep computation sub-steps in the use-case specification, activity diagram, or flowchart, not as separate use-case ovals.
6. Use `<<include>>` sparingly for required user-visible sub-functions.
7. Use `<<extend>>` for optional, conditional, or exception processes.
8. Treat dashboards as UI/navigation views, not standalone business use cases.
9. Confirm later whether Owner / Manager and Payroll Administrator are separate real users. If one person performs both roles, the approval workflow can be simplified but the use-case model can still show role separation for control.

---

# 17. Issue-Resolution Checklist

| Issue | Status |
|---|---|
| UC-01 Restore Backup no UC code | Fixed through UC-17. |
| UC-02 Compute Net Pay as include | Fixed; removed from include table. |
| UC-03 Submit Payroll for Review gap | Fixed through UC-16. |
| UC-04 Manage Company Information access mismatch | Fixed through restricted PA access and full SA access. |
| UC-05 Reopen Finalized Payroll Period scope missing | Fixed through UC-18 and Section 12.2. |
| UC-06 Dashboards no UC code | Fixed by documenting dashboards as UI views. |
| UC-07 Internal behaviors in include table | Fixed by moving them to specification notes. |
| CROSS-02 Computation breakdown no UC handling | Fixed as UC-09 sub-function and access-matrix row. |
| CROSS-03 Change Own Password missing | Fixed through UC-S01 and access-matrix row. |

