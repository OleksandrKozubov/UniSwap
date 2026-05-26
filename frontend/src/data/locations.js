const locations = [
  // KAUNAS
  {
    name: "Solo Society Student House",
    city: "Kaunas",
    university: "-",
    lat: 54.895688,
    lng: 23.916438
  },
  {
    name: "VMU Dormitory No. 2 (Baltija)",
    city: "Kaunas",
    university: "VMU",
    lat: 54.894562,
    lng: 23.924437
  },
  {
    name: "VMU Dormitory No. 5 (Akademija)",
    city: "Kaunas (Akademija)",
    university: "VMU",
    lat: 54.892187,
    lng: 23.828313
  },
  {
    name: "VMU Dormitory No. 7",
    city: "Kaunas (Akademija)",
    university: "VMU",
    lat: 54.892937,
    lng: 23.827063
  },

  {
    name: "Student Residence Hall",
    city: "Kaunas",
    university: "-",
    lat: 54.895812,
    lng: 23.895063
  },

  {
    name: "VMU Dormitory No. 4 (Akademija)",
    city: "Kaunas (Akademija)",
    university: "VMU",
    lat: 54.893187,
    lng: 23.829563
  },

  {
    name: "VMU Dormitory No. 10 (Akademija)",
    city: "Kaunas (Akademija)",
    university: "VMU",
    lat: 54.894437,
    lng: 23.832813
  }
];

const alphabetizedLocations = [...locations].sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
);

export default alphabetizedLocations;
