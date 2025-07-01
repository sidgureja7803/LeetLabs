import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create departments
  const departments = [
    { name: 'Computer Science and Engineering', code: 'CSE' },
    { name: 'Electronics and Communication Engineering', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'ME' },
    { name: 'Civil Engineering', code: 'CE' },
    { name: 'Electrical Engineering', code: 'EE' },
    { name: 'Chemical Engineering', code: 'CHE' },
    { name: 'Biotechnology Engineering', code: 'BT' },
    { name: 'Information Technology', code: 'IT' },
  ];

  console.log('Creating departments...');
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // Get CSE department for default assignments
  const cseDept = await prisma.department.findUnique({
    where: { code: 'CSE' },
  });

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  console.log('Creating default admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@thapar.edu' },
    update: {},
    create: {
      email: 'admin@thapar.edu',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      employeeId: 'ADMIN001',
      departmentId: cseDept?.id,
    },
  });

  // Create sample subjects for CSE department
  if (cseDept) {
    console.log('Creating sample subjects...');
    
    const subjects = [
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        description: 'Fundamental data structures and algorithms',
        semester: 3,
        credits: 4,
        departmentId: cseDept.id,
      },
      {
        name: 'Database Management Systems',
        code: 'CS301',
        description: 'Relational databases and SQL',
        semester: 5,
        credits: 4,
        departmentId: cseDept.id,
      },
      {
        name: 'Operating Systems',
        code: 'CS302',
        description: 'Process management, memory management, file systems',
        semester: 5,
        credits: 4,
        departmentId: cseDept.id,
      },
      {
        name: 'Computer Networks',
        code: 'CS401',
        description: 'Network protocols, TCP/IP, routing',
        semester: 7,
        credits: 3,
        departmentId: cseDept.id,
      },
      {
        name: 'Software Engineering',
        code: 'CS403',
        description: 'Software development lifecycle, design patterns',
        semester: 7,
        credits: 3,
        departmentId: cseDept.id,
      },
    ];

    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { code: subject.code },
        update: {},
        create: subject,
      });
    }
  }

  // Create sample teacher
  console.log('Creating sample teacher...');
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@thapar.edu' },
    update: {},
    create: {
      email: 'teacher@thapar.edu',
      password: teacherPassword,
      firstName: 'Dr. John',
      lastName: 'Smith',
      role: 'TEACHER',
      employeeId: 'TEACH001',
      departmentId: cseDept?.id,
    },
  });

  // Create sample student
  console.log('Creating sample student...');
  const studentPassword = await bcrypt.hash('student123', 12);
  
  const student = await prisma.user.upsert({
    where: { email: 'student@thapar.edu' },
    update: {},
    create: {
      email: 'student@thapar.edu',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'STUDENT',
      rollNumber: '101903001',
      departmentId: cseDept?.id,
    },
  });

  // Assign teacher to a subject
  const dsaSubject = await prisma.subject.findUnique({
    where: { code: 'CS201' },
  });

  if (dsaSubject && teacher) {
    console.log('Assigning teacher to subject...');
    const currentSemester = new Date().getFullYear() + (new Date().getMonth() >= 6 ? 'Fall' : 'Spring');
    
    await prisma.teacherSubject.upsert({
      where: {
        teacherId_subjectId_semester: {
          teacherId: teacher.id,
          subjectId: dsaSubject.id,
          semester: currentSemester,
        },
      },
      update: {},
      create: {
        teacherId: teacher.id,
        subjectId: dsaSubject.id,
        semester: currentSemester,
        isActive: true,
      },
    });
  }

  console.log('Database seed completed successfully!');
  console.log('\nDefault login credentials:');
  console.log('Admin: admin@thapar.edu / admin123');
  console.log('Teacher: teacher@thapar.edu / teacher123');
  console.log('Student: student@thapar.edu / student123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 