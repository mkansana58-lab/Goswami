
export interface SainikSchool {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  type: 'Government' | 'Private';
  // For prototype: a simulated proximity score, lower is "better"
  // In a real app, this would be dynamically calculated distance.
  simulatedProximityScore: number;
}

// Sample data for Sainik Schools. Replace with actual comprehensive data for production.
// Total 33 Government schools and 45 Private schools mentioned by user.
// This list is a small, representative sample.

export const sainikSchoolsData: SainikSchool[] = [
  // Government Schools (Sample)
  { id: 'ssg001', name: 'Sainik School, Kunjpura', city: 'Kunjpura', district: 'Karnal', state: 'Haryana', type: 'Government', simulatedProximityScore: 10 },
  { id: 'ssg002', name: 'Sainik School, Kapurthala', city: 'Kapurthala', district: 'Kapurthala', state: 'Punjab', type: 'Government', simulatedProximityScore: 20 },
  { id: 'ssg003', name: 'Sainik School, Chittorgarh', city: 'Chittorgarh', district: 'Chittorgarh', state: 'Rajasthan', type: 'Government', simulatedProximityScore: 15 },
  { id: 'ssg004', name: 'Sainik School, Korukonda', city: 'Korukonda', district: 'Vizianagaram', state: 'Andhra Pradesh', type: 'Government', simulatedProximityScore: 30 },
  { id: 'ssg005', name: 'Sainik School, Kazhakootam', city: 'Kazhakootam', district: 'Thiruvananthapuram', state: 'Kerala', type: 'Government', simulatedProximityScore: 25 },
  { id: 'ssg006', name: 'Sainik School, Ghorakhal', city: 'Ghorakhal', district: 'Nainital', state: 'Uttarakhand', type: 'Government', simulatedProximityScore: 12 },
  { id: 'ssg007', name: 'Sainik School, Rewa', city: 'Rewa', district: 'Rewa', state: 'Madhya Pradesh', type: 'Government', simulatedProximityScore: 18 },

  // Private Schools (Sample - Names are illustrative as actual new private Sainik Schools data might be specific)
  { id: 'ssp001', name: 'XYZ Sainik School Academy, Jaipur', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', type: 'Private', simulatedProximityScore: 5 },
  { id: 'ssp002', name: 'ABC Defence Sainik School, Lucknow', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', type: 'Private', simulatedProximityScore: 8 },
  { id: 'ssp003', name: 'Progressive Sainik School, Pune', city: 'Pune', district: 'Pune', state: 'Maharashtra', type: 'Private', simulatedProximityScore: 22 },
  { id: 'ssp004', name: 'Gurukul Sainik Vidyalaya, Sonepat', city: 'Sonepat', district: 'Sonepat', state: 'Haryana', type: 'Private', simulatedProximityScore: 7 },
  { id: 'ssp005', name: 'Modern Sainik Residential School, Dehradun', city: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', type: 'Private', simulatedProximityScore: 10 },
  { id: 'ssp006', name: 'Delta Sainik School, Bhopal', city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', type: 'Private', simulatedProximityScore: 16 },
  { id: 'ssp007', name: 'Vikas Sainik School, Patna', city: 'Patna', district: 'Patna', state: 'Bihar', type: 'Private', simulatedProximityScore: 28 },
];

// List of Indian states for dropdown (can be expanded)
export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];
