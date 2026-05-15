/**
 * Payroll Computation Engine — Earnings Calculator
 *
 * Computes all earning lines from attendance input and employee rate.
 * This is a pure function — no database access.
 */

import type { EmployeePayrollInput, EarningLine, StatutoryReferences } from "./types";

export function computeEarnings(
  input: EmployeePayrollInput,
  refs: StatutoryReferences
): EarningLine[] {
  const earnings: EarningLine[] = [];
  const basicPayType = refs.earning_type_map["BASIC_PAY"];
  const otPayType = refs.earning_type_map["OVERTIME_PAY"];
  const holidayPayType = refs.earning_type_map["HOLIDAY_PAY"];
  const restDayOtType = refs.earning_type_map["REST_DAY_OT_PAY"];
  const manualEarningType = refs.earning_type_map["MANUAL_EARNING_ADJUSTMENT"];

  // 1. Basic Pay
  let basicPay = 0;
  switch (input.pay_basis) {
    case "MONTHLY":
      // Monthly rate — deduct absences
      basicPay = input.rate_amount;
      if (input.absence_days > 0) {
        const dailyRate = input.rate_amount / input.working_days_per_month;
        basicPay -= dailyRate * input.absence_days;
      }
      // Deduct late/undertime
      if (input.late_minutes > 0 || input.undertime_minutes > 0) {
        const hourlyRate = input.rate_amount / input.working_days_per_month / input.working_hours_per_day;
        const totalMinutes = input.late_minutes + input.undertime_minutes;
        basicPay -= hourlyRate * (totalMinutes / 60);
      }
      break;
    case "DAILY":
      basicPay = input.rate_amount * input.days_worked;
      // Deduct late/undertime
      if (input.late_minutes > 0 || input.undertime_minutes > 0) {
        const hourlyRate = input.rate_amount / input.working_hours_per_day;
        const totalMinutes = input.late_minutes + input.undertime_minutes;
        basicPay -= hourlyRate * (totalMinutes / 60);
      }
      break;
    case "HOURLY":
      basicPay = input.rate_amount * (input.regular_hours_worked ?? (input.days_worked * input.working_hours_per_day));
      break;
  }

  basicPay = Math.max(0, round2(basicPay));

  if (basicPayType) {
    earnings.push({
      earning_type_id: basicPayType.earning_type_id,
      earning_code: "BASIC_PAY",
      description: "Basic Pay",
      quantity: input.pay_basis === "DAILY" ? input.days_worked : (input.pay_basis === "HOURLY" ? (input.regular_hours_worked ?? input.days_worked * input.working_hours_per_day) : 1),
      rate_used: input.rate_amount,
      amount: basicPay,
      is_taxable: true,
      source_manual_adjustment_id: null,
    });
  }

  // 2. Overtime Pay
  if (input.overtime_hours > 0) {
    let hourlyRate: number;
    switch (input.pay_basis) {
      case "MONTHLY":
        hourlyRate = input.rate_amount / input.working_days_per_month / input.working_hours_per_day;
        break;
      case "DAILY":
        hourlyRate = input.rate_amount / input.working_hours_per_day;
        break;
      case "HOURLY":
        hourlyRate = input.rate_amount;
        break;
    }
    const otPay = round2(hourlyRate * input.overtime_multiplier * input.overtime_hours);
    if (otPayType) {
      earnings.push({
        earning_type_id: otPayType.earning_type_id,
        earning_code: "OVERTIME_PAY",
        description: `Overtime Pay (${input.overtime_hours} hrs × ${input.overtime_multiplier}×)`,
        quantity: input.overtime_hours,
        rate_used: round2(hourlyRate * input.overtime_multiplier),
        amount: otPay,
        is_taxable: true,
        source_manual_adjustment_id: null,
      });
    }
  }

  // 3. Rest Day Overtime Pay
  if (input.rest_day_overtime_hours && input.rest_day_overtime_hours > 0) {
    let hourlyRate: number;
    switch (input.pay_basis) {
      case "MONTHLY": hourlyRate = input.rate_amount / input.working_days_per_month / input.working_hours_per_day; break;
      case "DAILY": hourlyRate = input.rate_amount / input.working_hours_per_day; break;
      case "HOURLY": hourlyRate = input.rate_amount; break;
    }
    const restDayMultiplier = input.overtime_multiplier * 1.30; // Additional 30% for rest day
    const rdOtPay = round2(hourlyRate * restDayMultiplier * input.rest_day_overtime_hours);
    if (restDayOtType) {
      earnings.push({
        earning_type_id: restDayOtType.earning_type_id,
        earning_code: "REST_DAY_OT_PAY",
        description: `Rest Day OT (${input.rest_day_overtime_hours} hrs)`,
        quantity: input.rest_day_overtime_hours,
        rate_used: round2(hourlyRate * restDayMultiplier),
        amount: rdOtPay,
        is_taxable: true,
        source_manual_adjustment_id: null,
      });
    }
  }

  // 4. Holiday Overtime Pay
  if (input.holiday_overtime_hours && input.holiday_overtime_hours > 0) {
    let hourlyRate: number;
    switch (input.pay_basis) {
      case "MONTHLY": hourlyRate = input.rate_amount / input.working_days_per_month / input.working_hours_per_day; break;
      case "DAILY": hourlyRate = input.rate_amount / input.working_hours_per_day; break;
      case "HOURLY": hourlyRate = input.rate_amount; break;
    }
    const holidayMultiplier = input.overtime_multiplier * 2.0; // Double time for holidays
    const holOtPay = round2(hourlyRate * holidayMultiplier * input.holiday_overtime_hours);
    if (holidayPayType) {
      earnings.push({
        earning_type_id: holidayPayType.earning_type_id,
        earning_code: "HOLIDAY_PAY",
        description: `Holiday OT (${input.holiday_overtime_hours} hrs)`,
        quantity: input.holiday_overtime_hours,
        rate_used: round2(hourlyRate * holidayMultiplier),
        amount: holOtPay,
        is_taxable: true,
        source_manual_adjustment_id: null,
      });
    }
  }

  // 5. Manual Earnings
  for (const adj of input.manual_earnings) {
    if (manualEarningType) {
      earnings.push({
        earning_type_id: manualEarningType.earning_type_id,
        earning_code: "MANUAL_EARNING_ADJUSTMENT",
        description: adj.adjustment_name,
        quantity: 1,
        rate_used: adj.amount,
        amount: adj.amount,
        is_taxable: adj.is_taxable,
        source_manual_adjustment_id: adj.manual_adjustment_id,
      });
    }
  }

  return earnings;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
