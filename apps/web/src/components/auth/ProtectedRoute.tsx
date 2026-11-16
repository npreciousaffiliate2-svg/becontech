import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.tsx';
import { PERSONA_PROFILES } from '../../context/personas.ts';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';
import { Button, Card, Badge } from '@campusone/ui';

interface ProtectedRouteProps {
  path: string;
  moduleName?: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  moduleName,
  children,
}) => {
  const { session } = useApp();
  const navigate = useNavigate();

  const currentPersona = PERSONA_PROFILES[session.activeRole] || PERSONA_PROFILES.STU;
  const isAllowed = path === '/profile' || currentPersona.allowedModules.includes(path);

  if (!isAllowed) {
    const defaultModule = currentPersona.allowedModules[0] || '/';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-red-200 bg-white p-6 shadow-sm text-center">
          <div className="w-14 h-14 rounded bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <Badge variant="danger" className="mb-3 px-3 py-1 font-semibold uppercase tracking-wider text-xs">
            Access Restricted
          </Badge>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Authorized Account Required
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            You do not currently have permission to access the{' '}
            <strong className="text-slate-900 font-semibold">{moduleName || path}</strong> page.
            Please switch to an authorized staff role or contact the school administrator.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-left mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Active Account:
              </span>
              <span className="font-semibold text-slate-800">{currentPersona.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Assigned Role:
              </span>
              <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                {currentPersona.scopeBadge} ({currentPersona.role})
              </span>
            </div>
            {currentPersona.department && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-700">{currentPersona.department}</span>
              </div>
            )}
            {currentPersona.matricNumber && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Matriculation No:</span>
                <span className="text-slate-700 font-semibold">{currentPersona.matricNumber}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="primary"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
              onClick={() => navigate(defaultModule)}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to My Workspace
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
