export type Solve = {
  id: number;
  userId: string;
  time: number; // in centiseconds
  scramble: string;
  dnf: boolean;
  plusTwo: boolean;
  createdAt: Date;
  updatedAt: Date;
};
