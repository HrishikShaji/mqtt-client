"use client"

import { Droplets, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { MqttClient } from "mqtt"
import { formatValue, getStatusColor } from "@/lib/utils"
import TemperatureModal from "./TemperatureModal"
import useTemperatureSensor from "@/features/temperature/hooks/useTemperatureSensor"

interface Props {
	client: MqttClient
	isConnected: boolean
}

export default function TemperatureCard({ client, isConnected }: Props) {
	const { handleTemperatureChange, temperatureData } = useTemperatureSensor({ client, isConnected })

	return (
		<Card className="relative rounded-4xl overflow-hidden bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
			<CardHeader className="relative">
				<div className="flex h-10 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2  ">
							<Thermometer className="h-5 w-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-white font-semibold">Temperature</CardTitle>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							className="cursor-pointer data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-black"
							checked={temperatureData.enabled}
							onCheckedChange={(checked) => handleTemperatureChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<TemperatureModal
							onChange={handleTemperatureChange}
							isConnected={isConnected}
							temperatureData={temperatureData}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 relative">
				<div className="text-center p-6 ">
					<div
						className={`text-6xl font-semibold ${getStatusColor(temperatureData.temperature, "temperature")} drop-shadow-lg tracking-tight`}
					>
						{formatValue(temperatureData.temperature)}°C
					</div>
					<div className="flex items-center justify-center gap-2 mt-3">
						<Droplets className="h-4 w-4 text-blue-400" />
						<div className="text-lg text-gray-500 font-medium">
							{formatValue(temperatureData.humidity)}% humidity
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
