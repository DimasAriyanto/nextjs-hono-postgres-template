'use client';

import React, { Component, ErrorInfo, ReactNode, FunctionComponent } from 'react';

export type TErrorComp = {
	message?: string | undefined;
	setState?: ({}: any) => void;
};

interface Props {
	children: ReactNode;
	ErrorContent: FunctionComponent<TErrorComp>;
}

interface State {
	hasError?: boolean;
	message?: string | undefined;
}

export class ErrorBoundaries extends Component<Props, State> {
	constructor(props: Props) {
		super(props);

		// Define a state variable to track whether is an error or not
		this.state = { hasError: false, message: '' };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI

		return { hasError: true, message: error.message };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// You can use your own error logging service here
		console.error('Uncaught error:', error, errorInfo);
	}

	render() {
		const { ErrorContent } = this.props;

		// Check if the error is thrown
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <ErrorContent message={this.state.message} setState={() => this.setState({ hasError: false, message: '' })} />;
		}

		// Return children components in case of no error
		return this.props.children;
	}
}
