import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface Metric {
  name: string;
  diagnostic: string;
  diagnostic_groups: string;
  standard_lower: number | null;
  standard_higher: number | null;
  everlab_lower: number | null;
  everlab_higher: number | null;
  oru_sonic_codes: string;
  oru_sonic_units: string;
  min_age: number | null;
  max_age: number | null;
  gender: string;
  lower_than_standard: boolean | null;
  higher_than_standard: boolean | null;
  lower_than_everlab: boolean | null;
  higher_than_everlab: boolean | null;
}

interface TestResult {
  code: string;
  unit: string;
  value: number | string;
  metric: Metric;
}

interface Props {
  data: TestResult[];
}

const HighlightTable: React.FC<Props> = ({ data }) => {
  const [showOutOfRangeOnly, setShowOutOfRangeOnly] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TestResult | null>(null);

  const isOutOfStandardRange = (metric: Metric): boolean => {
    return Boolean(metric.lower_than_standard || metric.higher_than_standard);
  }

  const isOutOfEverlabRange = (metric: Metric): boolean => {
    return Boolean(metric.lower_than_everlab || metric.higher_than_everlab);
  }

  const isOutOfRange = (metric: Metric): boolean => {
    return isOutOfStandardRange(metric) || isOutOfEverlabRange(metric);
  }

  const formatRange = (lower: number | null, higher: number | null): string => {
    if (lower !== null && higher !== null) {
      return lower === higher ? `${lower}` : `${lower} - ${higher}`;
    }
    if (lower !== null) {
      return `≥ ${lower}`;
    }
    if (higher !== null) {
      return `≤ ${higher}`;
    }
    return "N/A";
  };

  const handleRowClick = (row: TestResult) => {
    setSelectedRow(row);
  };

  const filteredData = data.filter((result) => {
    if (!showOutOfRangeOnly) return true;
    return isOutOfRange(result.metric);
  });

  const sortedData = filteredData.sort((a, b) =>
    a.metric.diagnostic_groups.localeCompare(b.metric.diagnostic_groups)
  );

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showOutOfRangeOnly}
              onChange={(e) => setShowOutOfRangeOnly(e.target.checked)}
            />
          }
          label="Show only out-of-range results"
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Standard Range</TableCell>
                <TableCell>Everlab Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((result) => {
                const { metric, code, value } = result;
                const outOfStandardRange = isOutOfStandardRange(metric);
                const outOfEverlabRange = isOutOfEverlabRange(metric);

                return (
                  <TableRow
                    key={code}
                    onClick={() => handleRowClick(result)}
                    style={{ cursor: "pointer" }}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f0f0f0", // Light gray background on hover
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {metric.diagnostic}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {value}{result.unit}
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: outOfStandardRange ? "#ffcccc" : "transparent",
                        fontWeight: outOfStandardRange ? "bold" : "normal",
                      }}
                    >
                      {formatRange(metric.standard_lower, metric.standard_higher)}
                    </TableCell>
                    <TableCell
                        style={{
                            backgroundColor: outOfEverlabRange ? "#ffcccc" : "transparent",
                            fontWeight: outOfEverlabRange ? "bold" : "normal",
                        }}
                    >
                      {formatRange(metric.everlab_lower, metric.everlab_higher)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Drawer
        anchor="right"
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        style={{ width: 300 }}
      >
        {selectedRow && (
          <Box padding={2} width={300}>
            <Typography variant="h6" gutterBottom>
              Details for {selectedRow.code}
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Diagnostic" secondary={selectedRow.metric.diagnostic} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Group" secondary={selectedRow.metric.diagnostic_groups} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Result"
                  secondary={`${selectedRow.value}${selectedRow.unit}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Standard Range"
                  secondary={formatRange(
                    selectedRow.metric.standard_lower,
                    selectedRow.metric.standard_higher
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Everlab Range"
                  secondary={formatRange(
                    selectedRow.metric.everlab_lower,
                    selectedRow.metric.everlab_higher
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ORU Sonic Codes"
                  secondary={selectedRow.metric.oru_sonic_codes}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ORU Sonic Units"
                  secondary={selectedRow.metric.oru_sonic_units}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Age Range"
                  secondary={`${selectedRow.metric.min_age} - ${selectedRow.metric.max_age}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Gender" secondary={selectedRow.metric.gender} />
              </ListItem>
            </List>
          </Box>
        )}
      </Drawer>
    </div>
  );
};

export default HighlightTable;
