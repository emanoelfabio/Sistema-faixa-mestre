export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateStudentId = (name: string, existingStudents: { id: string }[]): string => {
  if (!name.trim()) return generateId(); // Fallback for empty/whitespace name

  const firstName = name.trim().split(/\s+/)[0];
  // Capitalize first letter, rest lowercase for consistency e.g. John, not jOHN or john
  const normalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  let newId = '';
  let isUnique = false;
  
  while (!isUnique) {
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit number from 1000 to 9999
    newId = `${normalizedFirstName}${randomPart}`;
    
    // Check for uniqueness (case-insensitive)
    if (!existingStudents.some(student => student.id.toLowerCase() === newId.toLowerCase())) {
      isUnique = true;
    }
  }

  return newId;
};


export const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', defaultOptions);
  } catch (e) {
    return dateString; // fallback to original string if date is invalid
  }
};

export const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const getMonthName = (monthNumber: number): string => { // 1-12
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('pt-BR', { month: 'long' });
};

export const exportToCsv = (filename: string, rows: (string | number | undefined)[][]): void => {
  const processRow = (row: (string | number | undefined)[]): string => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
      if (typeof innerValue === 'string' && innerValue.includes(',')) {
        innerValue = `"${innerValue.replace(/"/g, '""')}"`;
      }
      let result = innerValue;
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvContent = '';
  for (const row of rows) {
    csvContent += processRow(row);
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};