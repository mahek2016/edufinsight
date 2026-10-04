import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { generateToken } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, role, gender } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'COUNSELLOR' ? 'COUNSELLOR' : 'STUDENT';
    const userGender = gender === 'FEMALE' ? 'FEMALE' : (gender === 'OTHER' ? 'OTHER' : 'MALE');

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        role: userRole,
        studentProfile: {
          create: {
            gender: userGender,
            studyPlan: {
              create: {
                country: 'United States',
                university: '',
                courseName: '',
                tuitionFee: 0,
                livingCost: 0,
                otherExpenses: 0,
                durationYears: 1
              }
            },
            fundingSource: {
              create: {
                savings: 0,
                scholarship: 0,
                feesAlreadyPaid: 0,
                familyContribution: 0,
                otherFunding: 0
              }
            },
            financialProfile: {
              create: {
                monthlyIncome: 0,
                annualIncome: 0,
                otherIncome: 0
              }
            }
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any
    });

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentProfileId: user.studentProfile?.id
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { studentProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any
    });

    return res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentProfileId: user.studentProfile?.id
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        studentProfile: {
          include: {
            studyPlan: true,
            fundingSource: true,
            financialProfile: {
              include: {
                assets: true,
                liabilities: true
              }
            },
            collaterals: true,
            documents: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (error: any) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Failed to fetch user session profile.' });
  }
}
