/**
 * Pomodoro Timer Integration Tests (OPA5)
 * 
 * This file contains OPA5 integration tests for the Pomodoro Timer feature.
 * Tests are designed to run in the UI5 test environment and verify user interactions.
 */

import Opa5 from "sap/ui/test/Opa5";

// Page Object for Pomodoro Timer
Opa5.createPageObjects({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onThePomodoroPage: {
		actions: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iClickTheStartButton(this: any) {
				return this.waitFor({
					id: "startPauseBtn",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					actions(btn: any) {
						btn.firePress();
					},
					errorMessage: "Did not find the Start button",
				});
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iClickTheResetButton(this: any) {
				return this.waitFor({
					id: "resetBtn",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					actions(btn: any) {
						btn.firePress();
					},
					errorMessage: "Did not find the Reset button",
				});
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iWaitSeconds(this: any, seconds: number) {
				return new Promise((resolve) => {
					setTimeout(resolve, seconds * 1000);
				});
			},
		},

		assertions: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iSeeTheTimerDisplaying(this: any, expectedTime: string) {
				return this.waitFor({
					id: "pomodoroDisplay",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					matchers: (display: any) => {
						return display.getText() === expectedTime;
					},
					errorMessage: `Timer should display ${expectedTime}`,
				});
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iSeeStartButtonLabel(this: any) {
				return this.waitFor({
					id: "startPauseBtn",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					matchers: (btn: any) => {
						return btn.getText() === "Start";
					},
					errorMessage: "Start button should show 'Start' label",
				});
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iSeePauseButtonLabel(this: any) {
				return this.waitFor({
					id: "startPauseBtn",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					matchers: (btn: any) => {
						return btn.getText() === "Pause";
					},
					errorMessage: "Start button should show 'Pause' label",
				});
			},

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iSeeSessionCount(this: any, count: number) {
				return this.waitFor({
					id: "sessionCounter",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					matchers: (counter: any) => {
						return counter.getText().includes(`Sessions completed: ${count}`);
					},
					errorMessage: `Session counter should show ${count} completed sessions`,
				});
			},
		},
	},
});

