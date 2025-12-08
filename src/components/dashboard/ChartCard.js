import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const ChartCard = ({ title, children }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
