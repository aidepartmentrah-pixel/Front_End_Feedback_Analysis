// src/components/SearchFilters.js
import React, { useState } from "react";

const RECORD_FIELDS = [
    "feedback_received_date",
    "record_id",
    "patient_full_name",
    "issuing_department",
    "target_department",
    "source_1",
    "feedback_type",
    "domain",
    "category",
    "sub_category",
    "classification_ar",
    "complaint_text",
    "immediate_action",
    "taken_action",
    "severity_level",
    "stage",
    "harm_level",
    "status",
    "improvement_opportunity_type"
]

const issuingDepartments = [
    "All",
    "cardiac 1",
    "cardiac 2",
    "cardiac 3",
    "CCU",
    "CSU",
    "ICN",
    "ICU",
    "ICU ارضي-تمريضي",
    "Lab-قسم التحاليل المخبرية",
    "New Cardiac3",
    "Post CSU",
    "ارضي-إستشفاء",
    "الأطفال",
    "الادارة التمريضية",
    "الادارة الطبية",
    "الرابع الغربي",
    "الرابع جديد ext",
    "الرابع شرقي",
    "الرابع شمالي",
    "الطابق الثاني",
    "العيادات الخارجية-OPD",
    "ثالث جديد",
    "ثالث شرقي",
    "ثالث غربي",
    "جراحة الأطفال",
    "دائرة الطوارئ التمريضية",
    "عيادات القلب المفتوح",
    "عيادات-طبية",
    "عيادة قلب - طبية",
    "غسيل الكلى",
    "قسم الأعمال غير التداخلية - تمريضي",
    "قسم التشخيص",
    "قسم التصوير الطبي",
    "قسم التوليد والجراحة النسائية-تمريضية",
    "قسم بنك الدم",
    "قسم عناية جراحة الكبد وزرع الأعضاء-ITU",
    "مكتب الدخول",
    "وحدة الإستعلامات والسنترال",
    "وحدة عيادات القلب- تمريض",
    "وحدة ما قبل الدخول"
];

const targetDepartments = [
    "All",
    "Call Center",
    "cardiac 1",
    "cardiac 2",
    "cardiac 3",
    "CCU",
    "CSU",
    "ICN",
    "ICU",
    "ICU -طبي",
    "Lab-قسم التحاليل المخبرية",
    "New Cardiac3",
    "Post CSU",
    "أقسام أمراض القلب-طبي",
    "ارضي-إستشفاء",
    "الأطفال",
    "الادارة الطبية",
    "التخدير - BCI",
    "الجراحة القلبية",
    "الخدمات البيئية",
    "الرابع الغربي",
    "الرابع جديد ext",
    "الرابع شرقي",
    "الرابع شمالي",
    "العيادات الخارجية-OPD",
    "المباني",
    "المطبخ-التغذية",
    "الهندسة الطبية",
    "ثالث جديد",
    "ثالث شرقي",
    "ثالث غربي",
    "جراحة الأطفال",
    "دائرة الطوارئ التمريضية",
    "دائرة الطوارئ الطبية",
    "دائرة المواد",
    "صيانة المعلوماتية",
    "عيادات القلب المفتوح",
    "قسم  الميكانيك",
    "قسم أمراض الكلى والضغط- طبية",
    "قسم أمراض قلب الأطفال",
    "قسم أمراض كهرباء القلب",
    "قسم الأعمال غير التداخلية - تمريضي",
    "قسم الاعمال التداخلية -تمريض",
    "قسم الامراض الجرثومية-طبي",
    "قسم الامراض الصدرية - طبية",
    "قسم الامن",
    "قسم التخدير والإنعاش",
    "قسم التشخيص",
    "قسم التصوير الطبي",
    "قسم التوليد والجراحة النسائية-تمريضية",
    "قسم الجراحة العامة -طبي",
    "قسم العمليات العامة",
    "قسم الفوترة",
    "قسم الكهرباء",
    "قسم امراض الأعصاب -الطبية",
    "قسم امراض الجهاز الهضمي -طبية",
    "قسم امراض العظم -طبي",
    "قسم امراض العيون-طبي",
    "قسم امراض المسالك البولية-طبية",
    "قسم بنك الدم",
    "قسم جراحة الاعصاب والدماغ -طبي",
    "قسم جراحة الشرايين والصدر-طبي",
    "مكتب الدخول",
    "مكتب الوافدين",
    "وحدة الأوردرلي",
    "وحدة الإستعلامات والسنترال",
    "وحدة جراحة الاطفال -طبي",
    "وحدة عيادات القلب- تمريض",
    "وحدة ما قبل الدخول"
];

const sources = ["All", "Phone", "Walk-in", "Email"];

const severities = ["All", "High", "Medium", "Low"];

const stages = [
    "All",
    "Examination &Diagnosis",
    "Admissions",
    "Care on the Ward",
    "Discharge/Transfer",
    "Operation/Procedure",
    "Unspecified"
];
const harmLevels = [
    "All",
    "Severe Harm",
    "Death",
    "High Severe",
    "Moderate Harm",
    "Minor Harm",
    "No Harm"
];
const domains = ["All", "Clinical", "Management", "Relational"];

const categories =  [
    "All",
    "Communication",
    "Environement",
    "Institutional Processes",
    "Listening",
    "Quality of Care",
    "Respect & Patient Rights",
    "Safety"
];
const subCategories = [
    "All",
    "Neglect -General",
    "Absent Communication",
    "Accomodation",
    "Bureaucracy",
    "Clinician -Errors",
    "Delay -Access",
    "Delay -General",
    "Delay -Procedure",
    "Delayed Communication",
    "Dimissing Patients",
    "Disrespect",
    "Documentation",
    "Equipement",
    "Error - Diagnosis",
    "Error -General",
    "Error -Medication",
    "Examination & Monitoring",
    "Failure to Provide",
    "Failure to Respond",
    "Ignoring Patients",
    "Incorrect Communication",
    "Neglect -Hygiene & Personal Care",
    "Rights",
    "Security",
    "Teamwork",
    "Visiting",
    "Ward Cleanliness"
];
const statuses = [
    "All",
    "Closed",
    "In Progress",
    "Red Flag"
];
const SearchFilters = ({ filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Primary Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          name="searchText"
          placeholder="Search by Name / ID"
          value={filters.searchText}
          onChange={handleChange}
        />
        <select name="issuingDept" value={filters.issuingDept} onChange={handleChange}>
          {issuingDepartments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="targetDept" value={filters.targetDept} onChange={handleChange}>
          {targetDepartments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="source" value={filters.source} onChange={handleChange}>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          <select name="severity" value={filters.severity} onChange={handleChange}>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="stage" value={filters.stage} onChange={handleChange}>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="harm" value={filters.harm} onChange={handleChange}>
            {harmLevels.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select name="domain" value={filters.domain} onChange={handleChange}>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="category" value={filters.category} onChange={handleChange}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="subCategory" value={filters.subCategory} onChange={handleChange}>
            {subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleChange}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
