type ParsedData = {
  code: string;
  unit: string;
  value: string;
  age: number | null;
  gender: string | null;
};

// FIXME: more validation needed
export function parseORUFile(data: string): ParsedData[] {
  // Split data into lines
  const lines = data
    .split("\r")
    .map((line) => line.trim())
    .filter((line) => line);

  // Group lines into segments starting with MSH
  const segments: string[][] = [];
  let currentSegment: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("MSH")) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
      }
      currentSegment = [line]; // Start a new segment
    } else {
      currentSegment.push(line); // Add to the current segment
    }
  });

  // Push the last segment if not empty
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  // Parse each segment and extract test information with patient data
  const parsedData: ParsedData[] = [];

  segments.forEach((segment) => {
    let age: number | null = null;
    let gender: string | null = null;

    segment.forEach((line) => {
      const parts = line.split("|");

      // Extract patient details from PID
      if (parts[0] === "PID") {
        const birthDate = parts[7]; // Birthdate in YYYYMMDD format
        gender = parts[8] || null;

        if (birthDate) {
          const birthYear = parseInt(birthDate.substring(0, 4), 10);
          const currentYear = new Date().getFullYear();
          age = currentYear - birthYear;
        }
      }

      // Extract test results from OBX
      if (parts[0] === "OBX") {
        const code = parts[3].split("^")[1]; // Test code
        const unit = parts[6].split("^")[0]; // Units
        const value = parts[5].split("^")[0]; // Test value

        if (code && unit && value) {
          parsedData.push({ code, unit, value, age, gender });
        }
      }
    });
  });

  return parsedData;
}

export async function getAbnormalResults(
  db: any,
  parsedData: {
    code: string;
    unit: string;
    value: string;
    age: number | null;
    gender: string | null;
  }[]
): Promise<any[]> {
  const results: any[] = [];

  for (const test of parsedData) {
    const { code, unit, value, age, gender } = test;

    const query = `
        SELECT *,
        CASE WHEN $6 THEN $5 < standard_lower ELSE NULL END AS lower_than_standard,
        CASE WHEN $6 THEN $5 > standard_higher ELSE NULL END AS higher_than_standard,
        CASE WHEN $6 THEN $5 < everlab_lower ELSE NULL END AS lower_than_everlab,
        CASE WHEN $6 THEN $5 > everlab_higher ELSE NULL END AS higher_than_everlab
        FROM diagnostic_metrics
        WHERE $1 = ANY(string_to_array(oru_sonic_codes, ';'))
          AND $2 = ANY(string_to_array(oru_sonic_units, ';'))
          AND ($3::INT IS NULL OR min_age IS NULL OR $3 >= min_age)
          AND ($3::INT IS NULL OR max_age IS NULL OR $3 <= max_age)
          AND ($4::TEXT IS NULL OR gender IS NULL OR gender = $4 OR gender = 'Any')
      `;

    const isNumeric = !isNaN(parseFloat(value));
    const metrics = await db.query(query, [code, unit, age, gender, isNumeric ? value : 0, isNumeric]);

    metrics.rows.forEach((metric: any) => {
      const numericValue = parseFloat(value);

      // Check against standard ranges
      if (
        (metric.standard_lower !== null &&
          numericValue < metric.standard_lower) ||
        (metric.standard_higher !== null &&
          numericValue > metric.standard_higher)
      ) {
        results.push({
          code,
          unit,
          value: numericValue,
          metric,
        });
      }
    });
  }

  return results;
}
