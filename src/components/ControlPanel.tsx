"use client"
import { useState, useEffect } from "react"
import mqtt, { type MqttClient } from "mqtt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Thermometer, Droplets, Zap, Power, Wifi, WifiOff, Send, MapPin, Gauge } from "lucide-react"
import TemperatureSensor from "./TemperatureSensor"
import { formatValue, getStatusColor } from "@/lib/utils"

export default function ControlPanel() {
	const [client, setClient] = useState<MqttClient | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [switchState, setSwitchState] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState("Disconnected")

	// Individual sensor states

	const [waterLevelData, setWaterLevelData] = useState({
		level: 75,
		capacity: 1000,
		status: "normal",
		sensor: "Ultrasonic",
		location: "Main Tank",
		enabled: true,
		alertsEnabled: true
	})

	const [powerData, setPowerData] = useState({
		voltage: 220.0,
		current: 5.5,
		power: 1210,
		frequency: 50.0,
		powerFactor: 0.95,
		sensor: "Power Meter",
		phase: "Single",
		enabled: true,
		monitoring: true
	})

	// Location and configuration options
	const tankLocations = ["Main Tank", "Backup Tank", "Storage Tank", "Emergency Tank", "Roof Tank"]
	const tankCapacities = [500, 750, 1000, 1500, 2000, 2500, 3000, 5000]

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

	const publishSensorData = (topic, data, sensorType) => {
		if (client && isConnected && data.enabled) {
			const message = {
				...data,
				timestamp: new Date().toISOString()
			}

			client.publish(topic, JSON.stringify(message), (err) => {
				if (err) {
					console.error(`Publish error for ${sensorType}:`, err)
				} else {
					console.log(`${sensorType} data published:`, message)
				}
			})
		}
	}

	const toggleSwitch = () => {
		if (client && isConnected) {
			const newState = !switchState
			setSwitchState(newState)

			const message = {
				state: newState,
				timestamp: new Date().toISOString(),
				device: "main-switch",
			}

			client.publish("switch/state", JSON.stringify(message), (err) => {
				if (err) {
					console.error("Publish error:", err)
				} else {
					console.log("Switch state published:", newState)
				}
			})
		}
	}


	const handleWaterLevelChange = (field, value) => {
		const newData = { ...waterLevelData, [field]: value }
		setWaterLevelData(newData)
		publishSensorData("sensors/waterlevel", newData, "Water Level")
	}

	const handlePowerChange = (field, value) => {
		const newData = { ...powerData, [field]: value }
		setPowerData(newData)
		publishSensorData("sensors/power", newData, "Power")
	}

	if (!client) return null

	return (
		<div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight text-balance">Trailer Control Panel</h1>
					<p className="text-muted-foreground text-lg">Interactive sensor control with sliders and toggles</p>
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

				{/* Sensor Controls Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Temperature Sensor Control */}
					<TemperatureSensor
						isConnected={isConnected}
						client={client}
					/>
					{/* Water Level Sensor Control */}
					<Card className="border-2">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Droplets className="h-5 w-5" />
									<div>
										<CardTitle>Water Level Sensor</CardTitle>
										<CardDescription>Ultrasonic - {waterLevelData.location}</CardDescription>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										checked={waterLevelData.enabled}
										onCheckedChange={(checked) => handleWaterLevelChange("enabled", checked)}
										disabled={!isConnected}
									/>
									<Badge variant={waterLevelData.enabled ? "default" : "secondary"}>
										{waterLevelData.enabled ? "ON" : "OFF"}
									</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Current Display */}
							<div className="text-center p-4 bg-muted/50 rounded-lg">
								<div className={`text-3xl font-bold ${getStatusColor(waterLevelData.level, "waterLevel")}`}>
									{waterLevelData.level}%
								</div>
								<Progress value={waterLevelData.level} className="mt-3" />
								<div className="text-sm text-muted-foreground mt-2 capitalize">
									Status: {waterLevelData.status}
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									{Math.round((waterLevelData.level / 100) * waterLevelData.capacity)}L / {waterLevelData.capacity}L
								</div>
							</div>

							{/* Water Level Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="flex items-center gap-2">
										<Gauge className="h-4 w-4" />
										Water Level
									</Label>
									<span className="text-sm font-medium">{waterLevelData.level}%</span>
								</div>
								<Slider
									value={[waterLevelData.level]}
									onValueChange={(value) => handleWaterLevelChange("level", value[0])}
									max={100}
									min={0}
									step={1}
									disabled={!isConnected || !waterLevelData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>Empty</span>
									<span>Full</span>
								</div>
							</div>

							{/* Tank Capacity Dropdown */}
							<div className="space-y-2">
								<Label>Tank Capacity</Label>
								<Select
									value={waterLevelData.capacity.toString()}
									onValueChange={(value) => handleWaterLevelChange("capacity", parseInt(value))}
									disabled={!isConnected || !waterLevelData.enabled}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{tankCapacities.map((capacity) => (
											<SelectItem key={capacity} value={capacity.toString()}>{capacity}L</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Status Dropdown */}
							<div className="space-y-2">
								<Label>Status</Label>
								<Select
									value={waterLevelData.status}
									onValueChange={(value) => handleWaterLevelChange("status", value)}
									disabled={!isConnected || !waterLevelData.enabled}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="critical">Critical</SelectItem>
										<SelectItem value="full">Full</SelectItem>
										<SelectItem value="overflow">Overflow</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Location and Alerts */}
							<div className="space-y-3">
								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										Location
									</Label>
									<Select
										value={waterLevelData.location}
										onValueChange={(value) => handleWaterLevelChange("location", value)}
										disabled={!isConnected || !waterLevelData.enabled}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{tankLocations.map((location) => (
												<SelectItem key={location} value={location}>{location}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center space-x-2">
									<Switch
										id="alerts"
										checked={waterLevelData.alertsEnabled}
										onCheckedChange={(checked) => handleWaterLevelChange("alertsEnabled", checked)}
										disabled={!isConnected || !waterLevelData.enabled}
									/>
									<Label htmlFor="alerts">Low level alerts</Label>
								</div>
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Send className="h-3 w-3" />
								<span>Auto-publishes to sensors/waterlevel</span>
							</div>
						</CardContent>
					</Card>

					{/* Power Sensor Control */}
					<Card className="border-2">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Zap className="h-5 w-5" />
									<div>
										<CardTitle>Power Sensor</CardTitle>
										<CardDescription>Power Meter - Single Phase</CardDescription>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										checked={powerData.enabled}
										onCheckedChange={(checked) => handlePowerChange("enabled", checked)}
										disabled={!isConnected}
									/>
									<Badge variant={powerData.enabled ? "default" : "secondary"}>
										{powerData.enabled ? "ON" : "OFF"}
									</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Current Display */}
							<div className="p-4 bg-muted/50 rounded-lg">
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Voltage:</span>
										<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.voltage)}V</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Current:</span>
										<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.current, 2)}A</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Power:</span>
										<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.power, 0)}W</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Frequency:</span>
										<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.frequency, 2)}Hz</span>
									</div>
								</div>
								<Separator className="my-3" />
								<div className="flex justify-center">
									<div className="flex justify-between w-full">
										<span className="text-muted-foreground">Power Factor:</span>
										<span className="text-purple-600 dark:text-purple-400 font-medium">{formatValue(powerData.powerFactor, 3)}</span>
									</div>
								</div>
							</div>

							{/* Voltage Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label>Voltage (V)</Label>
									<span className="text-sm font-medium">{formatValue(powerData.voltage)}V</span>
								</div>
								<Slider
									value={[powerData.voltage]}
									onValueChange={(value) => handlePowerChange("voltage", value[0])}
									max={300}
									min={100}
									step={0.1}
									disabled={!isConnected || !powerData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>100V</span>
									<span>300V</span>
								</div>
							</div>

							{/* Current Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label>Current (A)</Label>
									<span className="text-sm font-medium">{formatValue(powerData.current, 2)}A</span>
								</div>
								<Slider
									value={[powerData.current]}
									onValueChange={(value) => handlePowerChange("current", value[0])}
									max={50}
									min={0}
									step={0.01}
									disabled={!isConnected || !powerData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>0A</span>
									<span>50A</span>
								</div>
							</div>

							{/* Power Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label>Power (W)</Label>
									<span className="text-sm font-medium">{formatValue(powerData.power, 0)}W</span>
								</div>
								<Slider
									value={[powerData.power]}
									onValueChange={(value) => handlePowerChange("power", value[0])}
									max={10000}
									min={0}
									step={1}
									disabled={!isConnected || !powerData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>0W</span>
									<span>10kW</span>
								</div>
							</div>

							{/* Frequency Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label>Frequency (Hz)</Label>
									<span className="text-sm font-medium">{formatValue(powerData.frequency, 2)}Hz</span>
								</div>
								<Slider
									value={[powerData.frequency]}
									onValueChange={(value) => handlePowerChange("frequency", value[0])}
									max={65}
									min={45}
									step={0.01}
									disabled={!isConnected || !powerData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>45Hz</span>
									<span>65Hz</span>
								</div>
							</div>

							{/* Power Factor Slider */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label>Power Factor</Label>
									<span className="text-sm font-medium">{formatValue(powerData.powerFactor, 3)}</span>
								</div>
								<Slider
									value={[powerData.powerFactor]}
									onValueChange={(value) => handlePowerChange("powerFactor", value[0])}
									max={1}
									min={0}
									step={0.001}
									disabled={!isConnected || !powerData.enabled}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>0.000</span>
									<span>1.000</span>
								</div>
							</div>

							{/* Monitoring Toggle */}
							<div className="flex items-center space-x-2">
								<Switch
									id="monitoring"
									checked={powerData.monitoring}
									onCheckedChange={(checked) => handlePowerChange("monitoring", checked)}
									disabled={!isConnected || !powerData.enabled}
								/>
								<Label htmlFor="monitoring">Continuous monitoring</Label>
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Send className="h-3 w-3" />
								<span>Auto-publishes to sensors/power</span>
							</div>
						</CardContent>
					</Card>
				</div>

			</div>
		</div>
	)
}
