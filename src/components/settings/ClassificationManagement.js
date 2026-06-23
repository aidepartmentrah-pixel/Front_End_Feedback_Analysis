// src/components/settings/ClassificationManagement.js
// Settings tab: manage Classifications under existing Subcategories.
// Allowed: add, rename (AR/EN), freeze, unfreeze. No delete, no taxonomy editing.
import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Input, Chip, Alert, CircularProgress,
  Card, Table, Modal, ModalDialog, ModalClose, DialogTitle,
  DialogContent, DialogActions, FormControl, FormLabel, Divider,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import theme from "../../theme";

const API_BASE = "/api/settings/classifications";

// ─── helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path, opts = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.detail?.message || data?.message || data?.detail || "Request failed";
    throw new Error(msg);
  }
  return data;
}

// ─── AddClassificationModal ──────────────────────────────────────────────────

function AddClassificationModal({ subcategoryId, subcategoryName, onClose, onAdded }) {
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!nameAr.trim()) { setError("Arabic name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`${API_BASE}/`, {
        method: "POST",
        body: JSON.stringify({
          subcategory_id: subcategoryId,
          name_ar: nameAr.trim(),
          name_en: nameEn.trim() || null,
        }),
      });
      onAdded();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} sx={{ zIndex: 3000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <ModalDialog sx={{ width: { xs: '95vw', sm: '560px' }, maxWidth: '600px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
        <ModalClose />
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 700, pr: 4 }}>Add Classification</DialogTitle>
        <Typography level="body-sm" sx={{ color: theme.colors.textTertiary, mt: -0.5 }}>
          Subcategory: <strong>{subcategoryName}</strong>
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert color="danger" size="sm">{error}</Alert>}
          <FormControl required>
            <FormLabel>Arabic Name (الاسم بالعربية) *</FormLabel>
            <Input
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="أدخل الاسم بالعربية"
              dir="rtl"
            />
          </FormControl>
          <FormControl>
            <FormLabel>English Name (الاسم بالإنجليزية)</FormLabel>
            <Input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="Enter English name (optional)"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="solid" color="primary" onClick={handleSave} loading={saving} disabled={!nameAr.trim()}>
            Add
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

// ─── EditClassificationModal ─────────────────────────────────────────────────

function EditClassificationModal({ classification, onClose, onSaved }) {
  const [nameAr, setNameAr] = useState(classification.name_ar || "");
  const [nameEn, setNameEn] = useState(classification.name_en || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!nameAr.trim()) { setError("Arabic name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`${API_BASE}/${classification.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name_ar: nameAr.trim(),
          name_en: nameEn.trim() || null,
        }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} sx={{ zIndex: 3000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <ModalDialog sx={{ width: { xs: '95vw', sm: '560px' }, maxWidth: '600px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
        <ModalClose />
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 700, pr: 4 }}>Edit Classification</DialogTitle>
        <Divider sx={{ my: 1.5 }} />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1.5 }}>
          {error && <Alert color="danger" size="sm">{error}</Alert>}
          <FormControl required>
            <FormLabel>Arabic Name *</FormLabel>
            <Input
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="الاسم بالعربية"
              dir="rtl"
              sx={{ fontSize: '1rem' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>English Name</FormLabel>
            <Input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="English name (optional)"
              sx={{ fontSize: '1rem' }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="solid" color="primary" onClick={handleSave} loading={saving} disabled={!nameAr.trim()}>
            Save
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

// ─── SubcategoryPanel ─────────────────────────────────────────────────────────

function SubcategoryPanel({ subcategory, onDataChanged }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleFreezeToggle = async (cls) => {
    setActionError(null);
    const action = cls.is_active ? "freeze" : "unfreeze";
    try {
      await apiFetch(`${API_BASE}/${cls.id}/${action}`, { method: "PUT" });
      onDataChanged();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const activeCount = subcategory.classifications.filter(c => c.is_active).length;
  const frozenCount = subcategory.classifications.length - activeCount;

  return (
    <Box>
      {actionError && (
        <Alert color="danger" size="sm" sx={{ mb: 1 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip size="sm" color="success" variant="soft">{activeCount} active</Chip>
          {frozenCount > 0 && <Chip size="sm" color="warning" variant="soft">{frozenCount} frozen</Chip>}
        </Box>
        <Button
          size="sm"
          variant="soft"
          color="primary"
          onClick={() => setAddOpen(true)}
        >
          + Add Classification
        </Button>
      </Box>

      <Card variant="outlined" sx={{ overflow: "auto" }}>
        <Table
          stickyHeader
          sx={{
            "& thead th": {
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: theme.colors.textSecondary,
              py: 1.5,
              px: 2,
              background: theme.colors.surfaceHover,
            },
            "& tbody td": {
              py: 1.5,
              px: 2,
              borderBottom: `1px solid ${theme.colors.border}`,
            },
            "& tbody tr:last-child td": {
              borderBottom: "none",
            },
            "& tbody tr:hover td": {
              background: theme.colors.surfaceHover,
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 52 }}>ID</th>
              <th style={{ minWidth: 180 }}>Arabic Name</th>
              <th style={{ minWidth: 160 }}>English Name</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 170 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategory.classifications.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "24px 16px" }}>
                  <Typography level="body-sm" sx={{ color: theme.colors.textTertiary }}>No classifications yet.</Typography>
                </td>
              </tr>
            ) : (
              subcategory.classifications.map(cls => (
                <tr key={cls.id} style={{ opacity: cls.is_active ? 1 : 0.5 }}>
                  <td>
                    <Typography level="body-xs" sx={{ color: theme.colors.textTertiary, fontFamily: "monospace" }}>{cls.id}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" fontWeight={600} dir="rtl" sx={{ fontSize: "0.9rem" }}>{cls.name_ar}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ color: cls.name_en ? theme.colors.textPrimary : theme.colors.disabledText, fontStyle: cls.name_en ? "normal" : "italic" }}>
                      {cls.name_en || "—"}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      size="sm"
                      color={cls.is_active ? "success" : "warning"}
                      variant="soft"
                      sx={{ fontWeight: 600 }}
                    >
                      {cls.is_active ? "Active" : "Frozen"}
                    </Chip>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={() => setEditTarget(cls)}
                        sx={{ minWidth: 56 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        color={cls.is_active ? "warning" : "success"}
                        onClick={() => handleFreezeToggle(cls)}
                        sx={{ minWidth: 80 }}
                      >
                        {cls.is_active ? "Freeze" : "Unfreeze"}
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {addOpen && (
        <AddClassificationModal
          subcategoryId={subcategory.subcategory_id}
          subcategoryName={subcategory.subcategory_name}
          onClose={() => setAddOpen(false)}
          onAdded={onDataChanged}
        />
      )}

      {editTarget && (
        <EditClassificationModal
          classification={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={onDataChanged}
        />
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClassificationManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(`${API_BASE}/`);
      setData(result.subcategories || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (data || []).filter(sc => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sc.subcategory_name.toLowerCase().includes(q) ||
      sc.category_name.toLowerCase().includes(q) ||
      sc.domain_name.toLowerCase().includes(q) ||
      sc.classifications.some(
        c =>
          c.name_ar.toLowerCase().includes(q) ||
          (c.name_en || "").toLowerCase().includes(q)
      )
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography level="h4" fontWeight={700} sx={{ fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}>
          Classification Management
        </Typography>
      </Box>

      {error && (
        <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <Input
          placeholder="Search subcategory, category, domain, or classification name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 520 }}
          size="sm"
        />
        <Button size="sm" variant="soft" onClick={load} loading={loading}>
          Refresh
        </Button>
      </Box>

      {loading && !data ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography level="body-sm" sx={{ color: theme.colors.textTertiary, p: 2 }}>
          No subcategories found.
        </Typography>
      ) : (
        filtered.map(sc => (
          <Accordion
            key={sc.subcategory_id}
            expanded={expandedGroup === sc.subcategory_id}
            onChange={(_, expanded) =>
              setExpandedGroup(expanded ? sc.subcategory_id : null)
            }
            sx={{ mb: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "md", overflow: "hidden" }}
          >
            <AccordionSummary indicator={<ExpandMoreIcon />} sx={{ py: 1.5, px: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                <Typography level="title-md" fontWeight={700}>
                  {sc.subcategory_name}
                </Typography>
                <Typography level="body-xs" sx={{ color: theme.colors.textTertiary }}>
                  {sc.domain_name} › {sc.category_name}
                </Typography>
              </Box>
              <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center", pr: 1 }}>
                <Chip size="sm" variant="soft" color="primary">
                  {sc.classifications.filter(c => c.is_active).length} active
                </Chip>
                {sc.classifications.filter(c => !c.is_active).length > 0 && (
                  <Chip size="sm" variant="soft" color="warning">
                    {sc.classifications.filter(c => !c.is_active).length} frozen
                  </Chip>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <SubcategoryPanel
                subcategory={sc}
                onDataChanged={load}
              />
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
