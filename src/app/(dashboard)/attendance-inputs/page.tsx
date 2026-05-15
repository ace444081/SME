import { PageHeader, Card, EmptyState } from "@/components/ui/shared";

export default function AttendanceInputsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Attendance & Payroll Inputs" description="Encode attendance data for active payroll periods" />
      <Card>
        <EmptyState icon="📝" title="Select a Payroll Period" description="Go to Payroll Periods and select a period to encode attendance inputs." />
      </Card>
    </div>
  );
}
