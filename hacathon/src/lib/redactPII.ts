export function redactPII(data: any, xRedactPii: boolean): any {
  if (!xRedactPii) return data;

  if (Array.isArray(data)) {
    return data.map(item => redactPII(item, xRedactPii));
  }

  if (data && typeof data === 'object') {
    const redactedData = { ...data };
    
    // Mask typical PII fields
    if (redactedData.firstName) redactedData.firstName = '***';
    if (redactedData.lastName) redactedData.lastName = '***';
    if (redactedData.dob) redactedData.dob = '***';
    if (redactedData.mrn) redactedData.mrn = '***-***-***';
    
    // Recursive redaction for nested objects
    for (const key in redactedData) {
      if (typeof redactedData[key] === 'object') {
        redactedData[key] = redactPII(redactedData[key], xRedactPii);
      }
    }
    return redactedData;
  }

  return data;
}
