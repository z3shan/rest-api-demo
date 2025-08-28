import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/appError';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '90d') as SignOptions['expiresIn'];

const signToken = (id: string): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign({ id }, JWT_SECRET, options);
};

export class AuthService {
  /**
   * Register a new user
   */
  public async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 400);
    }

    // Create new user
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    // Generate JWT token
    const token = signToken(String(newUser._id));

    // Ensure password is omitted from serialized output via schema transform
    // and prevent exposing it on the returned object type
    const { password: _removedPassword, ...safeUser } = newUser.toObject();
    return { user: safeUser as unknown as IUser, token };
  }

  /**
   * Login a user
   */
  public async login(loginData: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    const { email, password } = loginData;

    // Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400);
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Generate JWT token
    const token = signToken(String(user._id));

    // Ensure password is omitted from serialized output via schema transform
    const { password: _removedPass, ...safeUserLogin } = user.toObject();

    return { user: safeUserLogin as unknown as IUser, token };
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }
}