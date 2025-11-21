import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const futureFlags = { v7_startTransition: true, v7_relativeSplatPath: true };

type Props = { children: React.ReactNode };

const TestRouter = ({ children }: Props) => (
  <BrowserRouter future={futureFlags}>{children}</BrowserRouter>
);

export { TestRouter, futureFlags };
