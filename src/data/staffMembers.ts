export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  mobileAllowance: number;
  bankAccountDetails: string;
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'u-2',
    employeeId: 'emp-101',
    name: 'Tariq Mehmood',
    email: 'tariq@kmztravels.com',
    phone: '+92 321 4567890',
    designation: 'Senior Tour Consultant & Visa Manager',
    department: 'Tour Operations & Visa Dept',
    basicSalary: 120000,
    houseRent: 25000,
    medicalAllowance: 10000,
    transportAllowance: 15000,
    mobileAllowance: 5000,
    bankAccountDetails: 'Meezan Bank - PK36MEZN000102938102',
  },
  {
    id: 'u-3',
    employeeId: 'emp-102',
    name: 'Aisha Malik',
    email: 'aisha@kmztravels.com',
    phone: '+92 333 1122334',
    designation: 'Accounts & Ticketing Specialist',
    department: 'Finance & Ticketing',
    basicSalary: 95000,
    houseRent: 20000,
    medicalAllowance: 8000,
    transportAllowance: 10000,
    mobileAllowance: 3000,
    bankAccountDetails: 'HBL Bank - PK88HABB000998811223',
  },
  {
    id: 'u-4',
    employeeId: 'emp-104',
    name: 'Usman Farooq',
    email: 'usman@kmztravels.com',
    phone: '+92 302 9988112',
    designation: 'Logistics & Transport Coordinator',
    department: 'Ground Operations & Fleet',
    basicSalary: 80000,
    houseRent: 16000,
    medicalAllowance: 6000,
    transportAllowance: 12000,
    mobileAllowance: 4000,
    bankAccountDetails: 'UBL Bank - PK12UNIL0008877112',
  },
  {
    id: 'u-5',
    employeeId: 'emp-103',
    name: 'Maulana Abdul Rehman',
    email: 'abdul.rehman@kmztravels.com',
    phone: '+92 300 7766554',
    designation: 'Group Leader / Senior Mutawwif',
    department: 'Religious Guidance & Pilgrimage Lead',
    basicSalary: 150000,
    houseRent: 30000,
    medicalAllowance: 12000,
    transportAllowance: 20000,
    mobileAllowance: 5000,
    bankAccountDetails: 'Faysal Bank Islamic - PK12FAYS0003019827364501',
  },
  {
    id: 'u-6',
    employeeId: 'emp-105',
    name: 'Zainab Bibi',
    email: 'zainab@kmztravels.com',
    phone: '+92 312 8877665',
    designation: 'Pilgrim Support & Concierge Executive',
    department: 'Customer Service & VIP Support',
    basicSalary: 75000,
    houseRent: 15000,
    medicalAllowance: 5000,
    transportAllowance: 10000,
    mobileAllowance: 3000,
    bankAccountDetails: 'Bank Alfalah - PK55ALFH000192837465',
  },
  {
    id: 'u-7',
    employeeId: 'emp-106',
    name: 'Farhan Ali',
    email: 'farhan@kmztravels.com',
    phone: '+92 304 5544332',
    designation: 'Digital Marketing & Systems Admin',
    department: 'Marketing & IT Systems',
    basicSalary: 85000,
    houseRent: 18000,
    medicalAllowance: 7000,
    transportAllowance: 10000,
    mobileAllowance: 4000,
    bankAccountDetails: 'Meezan Bank - PK36MEZN000992817364',
  },
];
