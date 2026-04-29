import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface Step {
	label: string;
	description?: string;
}

interface StepperProps {
	steps: Step[];
	currentStep: number;
	className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<ol className={cn('flex items-center w-full', className)}>
			{steps.map((step, index) => {
				const isCompleted = index < currentStep;
				const isActive = index === currentStep;
				const isLast = index === steps.length - 1;

				return (
					<li
						key={index}
						className={cn('flex items-center', !isLast && 'flex-1')}
					>
						<div className="flex flex-col items-center">
							<div
								className={cn(
									'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors',
									isCompleted && 'border-primary bg-primary text-primary-foreground',
									isActive && 'border-primary bg-background text-primary',
									!isCompleted && !isActive && 'border-muted-foreground/30 bg-background text-muted-foreground',
								)}
							>
								{isCompleted ? <Check className="size-4" /> : <span>{index + 1}</span>}
							</div>
							<div className="mt-1.5 text-center">
								<p
									className={cn(
										'text-xs font-medium',
										isActive && 'text-primary',
										!isActive && 'text-muted-foreground',
									)}
								>
									{step.label}
								</p>
								{step.description && (
									<p className="text-[10px] text-muted-foreground">{step.description}</p>
								)}
							</div>
						</div>
						{!isLast && (
							<div
								className={cn(
									'mx-2 h-0.5 flex-1 self-start mt-4 transition-colors',
									isCompleted ? 'bg-primary' : 'bg-muted-foreground/30',
								)}
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}
