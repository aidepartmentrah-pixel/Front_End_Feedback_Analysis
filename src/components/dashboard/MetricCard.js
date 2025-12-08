// src/components/MetricCard.js
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const MetricCard = ({ title, value }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
