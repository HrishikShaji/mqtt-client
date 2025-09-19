"use client"

import { useState, useEffect } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export default function SwitchControl() {
	const [client, setClient] = useState<MqttClient | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [switchState, setSwitchState] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('Disconnected');

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect('ws://localhost:8883');

		mqttClient.on('connect', () => {
			console.log('Connected to MQTT broker');
			setIsConnected(true);
			setConnectionStatus('Connected');
			setClient(mqttClient);
		});

		mqttClient.on('error', (err) => {
			console.error('MQTT connection error:', err);
			setConnectionStatus(`Error: ${err.message}`);
		});

		mqttClient.on('offline', () => {
			setIsConnected(false);
			setConnectionStatus('Offline');
		});

		mqttClient.on('reconnect', () => {
			setConnectionStatus('Reconnecting...');
		});

		return () => {
			if (mqttClient) {
				mqttClient.end();
			}
		};
	}, []);

	const toggleSwitch = () => {
		if (client && isConnected) {
			const newState = !switchState;
			setSwitchState(newState);

			// Publish switch state to MQTT topic
			const message = JSON.stringify({
				state: newState,
				timestamp: new Date().toISOString(),
				device: 'main-switch'
			});

			client.publish('switch/state', message, (err) => {
				if (err) {
					console.error('Publish error:', err);
				} else {
					console.log('Switch state published:', newState);
				}
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold text-center mb-6">Switch Control</h1>

				{/* Connection Status */}
				<div className="mb-6 p-3 rounded-md text-center">
					<span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
						}`}></span>
					<span className="text-sm font-medium">{connectionStatus}</span>
				</div>

				{/* Switch */}
				<div className="text-center mb-6">
					<button
						onClick={toggleSwitch}
						disabled={!isConnected}
						className={`relative inline-flex items-center h-16 w-32 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${switchState
							? 'bg-green-500'
							: 'bg-gray-300'
							} ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
					>
						<span
							className={`inline-block w-12 h-12 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${switchState ? 'translate-x-16' : 'translate-x-2'
								}`}
						/>
					</button>
				</div>

				{/* Switch State Display */}
				<div className="text-center">
					<p className="text-lg font-semibold mb-2">
						Switch is <span className={switchState ? 'text-green-600' : 'text-red-600'}>
							{switchState ? 'ON' : 'OFF'}
						</span>
					</p>
					<p className="text-sm text-gray-500">
						Click the switch to toggle state
					</p>
				</div>
			</div>
		</div>
	);
}
