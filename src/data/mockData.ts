import { Vehicle, Driver, Bodyguard } from '../contexts/AppContext';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Mercedes-Benz S-Class',
    category: 'Luxury Sedan',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      'https://images.unsplash.com/photo-1617531653520-bd5e3d5318d9?w=800',
      'https://images.unsplash.com/photo-1741088996480-5e4158b56396?w=800',
      'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
    ],
    imageCategories: {
      exterior: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
        'https://images.unsplash.com/photo-1617531653520-bd5e3d5318d9?w=800',
      ],
      interior: [
        'https://images.unsplash.com/photo-1741088996480-5e4158b56396?w=800',
        'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      ],
      registration: [
        'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
      ],
    },
    vin: '1HGCM82633A004352',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    features: ['GPS', 'Leather Seats', 'Sunroof', 'Bluetooth'],
    pricePerDay: 250,
    pricePerHour: 35,
    pricePerWeek: 1500,
    pricePerMonth: 5500,
    rating: 4.8,
    reviewCount: 124,
    city: 'New York',
    ownershipType: 'agent',
    agent: {
      id: 'a1',
      name: 'Michael Rodriguez',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      vehiclesOwned: 4,
      coverageArea: ['Manhattan', 'Brooklyn', 'Queens'],
      memberSince: 'Jan 2022'
    }
  },
  {
    id: 'v2',
    name: 'BMW 7 Series',
    category: 'Luxury Sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'https://images.unsplash.com/photo-1591079113724-559245bca3ff?w=800',
      'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
    ],
    imageCategories: {
      exterior: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      ],
      interior: [
        'https://images.unsplash.com/photo-1591079113724-559245bca3ff?w=800',
      ],
      registration: [
        'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
      ],
    },
    vin: 'WBA3A51010N100000',
    seats: 5,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    features: ['GPS', 'Leather Seats', 'Massage Seats', 'Premium Audio'],
    pricePerDay: 280,
    pricePerHour: 38,
    pricePerWeek: 1700,
    pricePerMonth: 6000,
    rating: 4.9,
    reviewCount: 89,
    city: 'New York',
    ownershipType: 'platform'
  },
  {
    id: 'v3',
    name: 'Range Rover Sport',
    category: 'Luxury SUV',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
    ],
    imageCategories: {
      exterior: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      ],
      interior: [
        'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      ],
      registration: [
        'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
      ],
    },
    vin: 'SAJAA04F78A100000',
    seats: 7,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    features: ['GPS', 'Leather Seats', '4WD', 'Panoramic Roof'],
    pricePerDay: 320,
    pricePerHour: 42,
    pricePerWeek: 1900,
    pricePerMonth: 6800,
    rating: 4.7,
    reviewCount: 156,
    city: 'New York',
    ownershipType: 'agent',
    agent: {
      id: 'a2',
      name: 'Sarah Thompson',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      vehiclesOwned: 6,
      coverageArea: ['Manhattan', 'Bronx', 'Staten Island'],
      memberSince: 'Mar 2021'
    }
  },
  {
    id: 'v4',
    name: 'Tesla Model S',
    category: 'Electric Luxury',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
      'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
    ],
    imageCategories: {
      exterior: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
      ],
      interior: [
        'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      ],
      registration: [
        'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
      ],
    },
    vin: '5YJ3E1EA8JF000000',
    seats: 5,
    fuelType: 'Electric',
    transmission: 'Automatic',
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Supercharging'],
    pricePerDay: 300,
    pricePerHour: 40,
    pricePerWeek: 1800,
    pricePerMonth: 6500,
    rating: 4.9,
    reviewCount: 203,
    city: 'New York',
    ownershipType: 'platform'
  },
  {
    id: 'v5',
    name: 'Audi A8',
    category: 'Luxury Sedan',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
    ],
    imageCategories: {
      exterior: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      ],
      interior: [
        'https://images.unsplash.com/photo-1609465397944-be1ce3ebda61?w=800',
      ],
      registration: [
        'https://images.unsplash.com/photo-1763082676977-c5dbc99094da?w=800',
      ],
    },
    vin: 'WAUZZZ8JZNA000000',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    features: ['GPS', 'Leather Seats', 'Matrix LED', 'Bang & Olufsen Audio'],
    pricePerDay: 260,
    pricePerHour: 36,
    pricePerWeek: 1600,
    pricePerMonth: 5800,
    rating: 4.8,
    reviewCount: 98,
    city: 'Los Angeles',
    ownershipType: 'agent',
    agent: {
      id: 'a3',
      name: 'James Wilson',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      vehiclesOwned: 3,
      coverageArea: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
      memberSince: 'Sep 2022'
    }
  },
];

export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'John Mitchell',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    experience: 8,
    compatibleVehicles: ['Luxury Sedan', 'SUV'],
    pricePerHour: 25,
    rating: 4.9,
    reviewCount: 156,
    city: 'New York',
    license: {
      number: '123456789',
      class: 'Class A',
      expiryDate: '2025-01-01',
      issuingState: 'NY'
    }
  },
  {
    id: 'd2',
    name: 'David Chen',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    experience: 12,
    compatibleVehicles: ['All Types'],
    pricePerHour: 30,
    rating: 5.0,
    reviewCount: 234,
    city: 'New York',
    license: {
      number: '987654321',
      class: 'Class A',
      expiryDate: '2026-01-01',
      issuingState: 'NY'
    }
  },
  {
    id: 'd3',
    name: 'Marcus Johnson',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    experience: 6,
    compatibleVehicles: ['Luxury Sedan', 'Electric'],
    pricePerHour: 22,
    rating: 4.7,
    reviewCount: 89,
    city: 'New York',
    license: {
      number: '456789123',
      class: 'Class A',
      expiryDate: '2024-01-01',
      issuingState: 'NY'
    }
  },
];

export const mockBodyguards: Bodyguard[] = [
  {
    id: 'b1',
    name: 'James Carter',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    experience: 15,
    securityLevel: 'Executive',
    teamSize: 1,
    teamMembers: [
      {
        name: 'James Carter',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        role: 'Lead Bodyguard'
      }
    ],
    pricePerHour: 80,
    rating: 4.9,
    city: 'New York'
  },
  {
    id: 'b2',
    name: 'Elite Security Team',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    experience: 10,
    securityLevel: 'VIP',
    teamSize: 3,
    teamMembers: [
      {
        name: 'Marcus Rodriguez',
        image: 'https://images.unsplash.com/photo-1761064392859-2bfa734e9f3f?w=400',
        role: 'Team Lead'
      },
      {
        name: 'Sarah Mitchell',
        image: 'https://images.unsplash.com/photo-1592348283763-78f2ca1e1866?w=400',
        role: 'Security Specialist'
      },
      {
        name: 'Kevin Thompson',
        image: 'https://images.unsplash.com/photo-1719845202038-d57a8b79b83f?w=400',
        role: 'Security Officer'
      }
    ],
    pricePerHour: 200,
    rating: 5.0,
    city: 'New York'
  },
  {
    id: 'b3',
    name: 'Michael Torres',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
    experience: 8,
    securityLevel: 'Standard',
    teamSize: 1,
    teamMembers: [
      {
        name: 'Michael Torres',
        image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
        role: 'Personal Security'
      }
    ],
    pricePerHour: 60,
    rating: 4.8,
    city: 'New York'
  },
];
