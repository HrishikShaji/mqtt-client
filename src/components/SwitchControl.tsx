"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff, Settings } from "lucide-react"

export default function SwitchControl() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [switchState, setSwitchState] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	// Sensor states for display
	const [temperatureData, setTemperatureData] = useState(null)
	const [waterLevelData, setWaterLevelData] = useState(null)
	const [powerData, setPowerData] = useState(null)
	const [sensorsEnabled, setSensorsEnabled] = useState(true)

	useEffect(() => {
		// Connect to MQTT broker via WebSocket
		const mqttClient = mqtt.connect("ws://localhost:8883")

		mqttClient.on("connect", () => {
			console.log("Connected to MQTT broker")
			setIsConnected(true)
			setConnectionStatus("Connected")
			setClient(mqttClient)
		})

		mqttClient.on("error", (err) => {
			console.error("MQTT connection error:", err)
			setConnectionStatus(`Error: ${err.message}`)
		})

		mqttClient.on("offline", () => {
			setIsConnected(false)
			setConnectionStatus("Offline")
		})

		mqttClient.on("reconnect", () => {
			setConnectionStatus("Reconnecting...")
		})

		return () => {
			if (mqttClient) {
				mqttClient.end()
			}
		}
	}, [])

	// Mock sensor data generators
	useEffect(() => {
		if (!isConnected || !client || !sensorsEnabled) return

		const generateSensorData = () => {
			// Generate temperature data (18-35°C)
			const tempData = {
				temperature: (18 + Math.random() * 17).toFixed(1),
				humidity: (40 + Math.random() * 40).toFixed(1),
				timestamp: new Date().toISOString(),
				sensor: "DHT22",
				location: "Living Room",
			}

			// Generate water level data (0-100%)
			const waterData = {
				level: Math.floor(Math.random() * 101),
				capacity: 1000, // liters
				status: Math.random() > 0.8 ? "low" : "normal",
				timestamp: new Date().toISOString(),
				sensor: "Ultrasonic",
				location: "Main Tank",
			}

			// Generate power data
			const powerData = {
				voltage: (220 + (Math.random() - 0.5) * 20).toFixed(1),
				current: (Math.random() * 15).toFixed(2),
				power: (Math.random() * 3000).toFixed(0),
				frequency: (50 + (Math.random() - 0.5) * 0.5).toFixed(2),
				powerFactor: (0.85 + Math.random() * 0.1).toFixed(3),
				timestamp: new Date().toISOString(),
				sensor: "Power Meter",
				phase: "Single",
			}

			// Update local state for display
			setTemperatureData(tempData)
			setWaterLevelData(waterData)
			setPowerData(powerData)

			// Publish sensor data to MQTT topics
			client.publish("sensors/temperature", JSON.stringify(tempData))
			client.publish("sensors/waterlevel", JSON.stringify(waterData))
			client.publish("sensors/power", JSON.stringify(powerData))

			console.log("Published sensor data:", { tempData, waterData, powerData })
		}

		// Generate initial data after connection
		setTimeout(generateSensorData, 1000)

		// Generate data every 5 seconds
		const interval = setInterval(generateSensorData, 5000)

		return () => clearInterval(interval)
	}, [isConnected, client, sensorsEnabled])

	const toggleSwitch = () => {
		if (client && isConnected) {
			const newState = !switchState
			setSwitchState(newState)

			// Publish switch state to MQTT topic
			const message = JSON.stringify({
				state: newState,
				timestamp: new Date().toISOString(),
				device: "main-switch",
			})

			client.publish("switch/state", message, (err) => {
				if (err) {
					console.error("Publish error:", err)
				} else {
					console.log("Switch state published:", newState)
				}
			})
		}
	}

	const toggleSensors = () => {
		setSensorsEnabled(!sensorsEnabled)
	}

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString()
	}

	const getStatusColor = (value, type) => {
		switch (type) {
			case "temperature":
				if (value < 20) return "text-blue-600 dark:text-blue-400"
				if (value > 30) return "text-red-600 dark:text-red-400"
				return "text-green-600 dark:text-green-400"
			case "waterLevel":
				if (value < 20) return "text-red-600 dark:text-red-400"
				if (value < 50) return "text-yellow-600 dark:text-yellow-400"
				return "text-green-600 dark:text-green-400"
			default:
				return "text-muted-foreground"
		}
	}

	return (
		<div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight text-balance">Trailer Control Panel</h1>
					{/* <p className="text-muted-foreground text-lg">Manage devices and sensor data generation</p> */}
				</div>

				{/* Connection Status */}
				<Card className="border-2">
					<CardContent className="pt-6">
						<div className="flex items-center justify-center gap-3">
							{isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
							<Badge variant={isConnected ? "default" : "destructive"} className="text-sm px-3 py-1">
								{connectionStatus}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Main Switch Control */}
				<Card className="border-2">
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2 text-2xl">
							<Power className="h-6 w-6" />
							Main Switch Control
						</CardTitle>
						<CardDescription>Control the main device switch remotely</CardDescription>
					</CardHeader>
					<CardContent className="space-y-8">
						{/* Switch Toggle */}
						<div className="flex flex-col items-center space-y-6">
							<Button
								onClick={toggleSwitch}
								disabled={!isConnected}
								size="lg"
								variant={switchState ? "default" : "outline"}
								className={`h-20 w-40 text-xl font-bold transition-all duration-300 ${switchState
									? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
									: "hover:bg-muted"
									} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{switchState ? "ON" : "OFF"}
							</Button>

							<div className="text-center space-y-2">
								<p className="text-lg font-semibold">
									Switch is{" "}
									<span
										className={switchState ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
									>
										{switchState ? "ON" : "OFF"}
									</span>
								</p>
								<p className="text-sm text-muted-foreground">Click the button to toggle state</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Sensor Control */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									Sensor Data Generation
								</CardTitle>
								<CardDescription className="mt-2">
									{sensorsEnabled
										? "Generating mock sensor data every 5 seconds..."
										: "Sensor data generation is paused"}
								</CardDescription>
							</div>
							<div className="flex items-center space-x-2">
								<Switch checked={sensorsEnabled} onCheckedChange={toggleSensors} disabled={!isConnected} />
								<Badge variant={sensorsEnabled ? "default" : "secondary"}>{sensorsEnabled ? "ON" : "OFF"}</Badge>
							</div>
						</div>
					</CardHeader>

					{/* Current Sensor Readings */}
					{sensorsEnabled && (
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Temperature */}
								<Card className="bg-muted/50">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-lg">
											<Thermometer className="h-4 w-4" />
											Temperature
										</CardTitle>
									</CardHeader>
									<CardContent>
										{temperatureData ? (
											<div className="space-y-3">
												<div className="text-center">
													<div
														className={`text-2xl font-bold ${getStatusColor(Number.parseFloat(temperatureData.temperature), "temperature")}`}
													>
														{temperatureData.temperature}°C
													</div>
													<div className="text-sm text-muted-foreground">Humidity: {temperatureData.humidity}%</div>
												</div>
												<Separator />
												<div className="text-xs text-muted-foreground text-center">{temperatureData.location}</div>
											</div>
										) : (
											<div className="text-center py-4 text-muted-foreground">
												<Activity className="h-6 w-6 mx-auto mb-2 animate-pulse" />
											</div>
										)}
									</CardContent>
								</Card>

								{/* Water Level */}
								<Card className="bg-muted/50">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-lg">
											<Droplets className="h-4 w-4" />
											Water Level
										</CardTitle>
									</CardHeader>
									<CardContent>
										{waterLevelData ? (
											<div className="space-y-3">
												<div className="text-center">
													<div className={`text-2xl font-bold ${getStatusColor(waterLevelData.level, "waterLevel")}`}>
														{waterLevelData.level}%
													</div>
													<Progress value={waterLevelData.level} className="mt-2" />
												</div>
												<Separator />
												<div className="text-xs text-muted-foreground text-center">Status: {waterLevelData.status}</div>
											</div>
										) : (
											<div className="text-center py-4 text-muted-foreground">
												<Activity className="h-6 w-6 mx-auto mb-2 animate-pulse" />
											</div>
										)}
									</CardContent>
								</Card>

								{/* Power */}
								<Card className="bg-muted/50">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-lg">
											<Zap className="h-4 w-4" />
											Power
										</CardTitle>
									</CardHeader>
									<CardContent>
										{powerData ? (
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Voltage:</span>
													<span className="text-purple-600 dark:text-purple-400">{powerData.voltage}V</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Power:</span>
													<span className="text-purple-600 dark:text-purple-400">{powerData.power}W</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Current:</span>
													<span className="text-purple-600 dark:text-purple-400">{powerData.current}A</span>
												</div>
											</div>
										) : (
											<div className="text-center py-4 text-muted-foreground">
												<Activity className="h-6 w-6 mx-auto mb-2 animate-pulse" />
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</CardContent>
					)}
				</Card>

				{/* System Status */}
				<Card>
					<CardHeader>
						<CardTitle>System Status</CardTitle>
						<CardDescription>MQTT topics and data generation information</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-3">
								<h4 className="font-semibold">MQTT Topics Publishing:</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											switch/state
										</Badge>
										<span>Switch control data</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											sensors/temperature
										</Badge>
										<span>Temperature & humidity</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											sensors/waterlevel
										</Badge>
										<span>Water tank monitoring</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="text-xs">
											sensors/power
										</Badge>
										<span>Power consumption data</span>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<h4 className="font-semibold">Data Generation:</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<div>• Update Interval: 5 seconds</div>
									<div>• Temperature Range: 18-35°C</div>
									<div>• Water Level: 0-100%</div>
									<div>• Power: Realistic electrical readings</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
