import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Sheet } from "@mui/joy";
import PublishIcon from "@mui/icons-material/Publish";
import { fetchRecentPublicationBatches } from "../../api/publicationBatchApi";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const LatestPublicationBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchRecentPublicationBatches()
      .then((data) => {
        if (isMounted) setBatches(data.batches || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load publication batches");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography
        level="h4"
        sx={{
          mb: 2,
          color: "#1a1e3f",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <PublishIcon sx={{ color: "#667eea" }} />
        Latest Publication Batches
      </Typography>

      {error && (
        <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
        <Table
          size="sm"
          sx={{
            "& thead th": {
              bgcolor: "#f5f7fa",
              fontWeight: 700,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#667eea",
              borderBottom: "2px solid #667eea20",
            },
            "& tbody td": {
              fontSize: "13px",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Batch Serial</th>
              <th style={{ width: "30%" }}>Published Date</th>
              <th style={{ width: "30%" }}>Published By</th>
              <th style={{ width: "20%", textAlign: "center" }}>Cases Published</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-sm" sx={{ color: "#999" }}>
                    Loading...
                  </Typography>
                </td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-sm" sx={{ color: "#999" }}>
                    No publication batches yet
                  </Typography>
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.publication_batch_id}>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600, color: "#667eea" }}>
                      #{batch.publication_serial}
                    </Typography>
                  </td>
                  <td>{formatDateTime(batch.published_at)}</td>
                  <td>{batch.published_by || "-"}</td>
                  <td style={{ textAlign: "center" }}>{batch.cases_published_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
    </Card>
  );
};

export default LatestPublicationBatches;
