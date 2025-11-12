import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import Text from "sap/m/Text";

/**
 * Pomodoro Timer Controller
 * 
 * Implementiert einen 25-Minuten Pomodoro Timer mit:
 * - Start/Pause/Reset Funktionalität
 * - Session Counter (localStorage persistent)
 * - MM:SS Time Display Format
 */
export default class PomodoroTimerController extends Controller {
	private _totalSeconds = 25 * 60; // 1500 seconds = 25 minutes
	private _remainingSeconds = 1500;
	private _isRunning = false;
	private _sessionCount = 0;
	private _intervalId: NodeJS.Timeout | null = null;

	public onInit(): void {
		// Load session count from localStorage
		this._loadSessionCount();

		// Initialize JSON Model for bindings
		const timerModel = new JSONModel({
			timeDisplay: this._formatTime(this._remainingSeconds),
			sessionCount: this._sessionCount,
			isRunning: this._isRunning,
			buttonLabel: "Start",
		});
		this.getView()?.setModel(timerModel, "timer");

		// Initial display update
		this._updateDisplay();
	}

	/**
	 * Toggle between Start and Pause
	 */
	public onStartPause(): void {
		if (this._isRunning) {
			this._pauseTimer();
		} else {
			this._startTimer();
		}
		this._updateButtonState();
	}

	/**
	 * Reset timer to 25:00
	 */
	public onReset(): void {
		// Stop timer if running
		if (this._isRunning) {
			this._stopTimer();
		}

		// Reset state
		this._remainingSeconds = this._totalSeconds;
		this._isRunning = false;

		// Update UI
		this._updateDisplay();
		this._updateButtonState();
	}

	/**
	 * Start the timer
	 */
	private _startTimer(): void {
		this._isRunning = true;

		// Set interval to decrement every second
		this._intervalId = setInterval(() => {
			this._decrementTimer();
		}, 1000);
	}

	/**
	 * Pause the timer
	 */
	private _pauseTimer(): void {
		this._isRunning = false;
		this._stopTimer();
	}

	/**
	 * Stop the interval
	 */
	private _stopTimer(): void {
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		}
	}

	/**
	 * Decrement timer by 1 second
	 */
	private _decrementTimer(): void {
		if (this._remainingSeconds > 0) {
			this._remainingSeconds--;
			this._updateDisplay();

			// Timer completed
			if (this._remainingSeconds === 0) {
				this._handleTimerComplete();
			}
		}
	}

	/**
	 * Handle timer completion
	 */
	private _handleTimerComplete(): void {
		this._stopTimer();
		this._isRunning = false;

		// Increment session count
		this._sessionCount++;
		this._saveSessionCount();

		// Play notification sound (optional)
		this._playNotificationSound();

		// Update display
		this._updateDisplay();
		this._updateButtonState();

		// Show browser notification (optional)
		this._showBrowserNotification();
	}

	/**
	 * Play notification sound when timer completes
	 */
	private _playNotificationSound(): void {
		try {
			// Create a simple beep sound using Web Audio API
			const audioContext = new (window as any).AudioContext();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			// Beep parameters
			oscillator.frequency.value = 800; // Hz
			oscillator.type = "sine";

			// Duration: 0.5 seconds
			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.5);
		} catch (error) {
			// Audio API not available or not supported
			console.debug("Audio notification not available");
		}
	}

	/**
	 * Show browser notification (requires permission)
	 */
	private _showBrowserNotification(): void {
		try {
			if ("Notification" in window && Notification.permission === "granted") {
				new Notification("Pomodoro Timer", {
					body: "Your 25-minute Pomodoro session is complete!",
					icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23FF6B6B'/></svg>",
				});
			}
		} catch (error) {
			console.debug("Notification not available");
		}
	}

	/**
	 * Update the display text with formatted time and session count
	 */
	private _updateDisplay(): void {
		const model = this.getView()?.getModel("timer") as JSONModel;
		if (model) {
			model.setProperty("/timeDisplay", this._formatTime(this._remainingSeconds));
			model.setProperty("/sessionCount", this._sessionCount);
		}
	}

	/**
	 * Update button state (Start/Pause label)
	 */
	private _updateButtonState(): void {
		const model = this.getView()?.getModel("timer") as JSONModel;
		if (model) {
			model.setProperty("/isRunning", this._isRunning);
			model.setProperty("/buttonLabel", this._isRunning ? "Pause" : "Start");
		}
	}

	/**
	 * Format seconds to MM:SS string
	 * @param seconds - Total seconds
	 * @returns Formatted time string "MM:SS"
	 */
	private _formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;

		const minutesStr = String(minutes).padStart(2, "0");
		const secondsStr = String(secs).padStart(2, "0");

		return `${minutesStr}:${secondsStr}`;
	}

	/**
	 * Load session count from localStorage
	 */
	private _loadSessionCount(): void {
		try {
			const stored = localStorage.getItem("pomodoro_sessions");
			this._sessionCount = stored ? parseInt(stored, 10) : 0;
		} catch (error) {
			console.debug("localStorage not available, using runtime-only state");
			this._sessionCount = 0;
		}
	}

	/**
	 * Save session count to localStorage
	 */
	private _saveSessionCount(): void {
		try {
			localStorage.setItem("pomodoro_sessions", String(this._sessionCount));
		} catch (error) {
			console.debug("localStorage not available, session count not persisted");
		}
	}

	/**
	 * Cleanup on view destruction
	 */
	public onExit(): void {
		// Stop timer if running
		if (this._isRunning) {
			this._stopTimer();
		}
	}
}
