// src/components/RecordsTable.js
import React from "react";

const RecordsTable = ({ records, filters }) => {

  // FILTER LOGIC
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.record_id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      record.patient_full_name.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesIssuing =
      filters.issuingDept === "All" || record.issuing_department === filters.issuingDept;
    const matchesTarget =
      filters.targetDept === "All" || record.target_department === filters.targetDept;
    const matchesSource =
      filters.source === "All" || record.source_1 === filters.source;
    return matchesSearch && matchesIssuing && matchesTarget && matchesSource;
  });

  return (
    <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Feedback Date</th>
          <th>Record ID</th>
          <th>Patient Name</th>
          <th>Issuing Dept</th>
          <th>Target Dept</th>
          <th>Source</th>
          <th>Feedback Type</th>
          <th>Domain</th>
          <th>Category</th>
          <th>Sub-Category</th>
          <th>Arabic Classification</th>
          <th>Complaint Text</th>
          <th>Immediate Action</th>
          <th>Taken Action</th>
          <th>Severity</th>
          <th>Stage</th>
          <th>Harm Level</th>
          <th>Status</th>
          <th>Improvement Opportunity</th>
        </tr>
      </thead>
      <tbody>
        {filteredRecords.map(r => (
          <tr key={r.record_id}>
            <td>{r.feedback_received_date}</td>
            <td>{r.record_id}</td>
            <td>{r.patient_full_name}</td>
            <td>{r.issuing_department}</td>
            <td>{r.target_department}</td>
            <td>{r.source_1}</td>
            <td>{r.feedback_type}</td>
            <td>{r.domain}</td>
            <td>{r.category}</td>
            <td>{r.sub_category}</td>
            <td>{r.classification_ar}</td>
            <td>{r.complaint_text}</td>
            <td>{r.immediate_action}</td>
            <td>{r.taken_action}</td>
            <td>{r.severity_level}</td>
            <td>{r.stage}</td>
            <td>{r.harm_level}</td>
            <td>{r.status}</td>
            <td>{r.improvement_opportunity_type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};



export default RecordsTable;
