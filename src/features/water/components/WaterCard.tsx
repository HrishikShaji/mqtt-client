"use client"

import { Droplets } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { MqttClient } from "mqtt"
import { getStatusColor } from "@/lib/utils"
import WaterModal from "./WaterModal"
import useWaterSensor from "@/features/water/hooks/useWaterSensor"

interface Props {
	client: MqttClient
	isConnected: boolean
}

export default function WaterCard({ client, isConnected }: Props) {
	const { waterLevelData, handleWaterLevelChange } = useWaterSensor({ client, isConnected })
	return (
		<Card className="relative rounded-4xl bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
			<CardHeader className="relative">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 ">
							<Droplets className="h-5 w-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-white font-semibold">Water</CardTitle>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							className="cursor-pointer data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-black"
							checked={waterLevelData.enabled}
							onCheckedChange={(checked) => handleWaterLevelChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<WaterModal onChange={handleWaterLevelChange} isConnected={isConnected} waterData={waterLevelData} />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 relative">
				<div className="text-center p-6 ">
					<div
						className={`text-6xl font-semibold ${getStatusColor(waterLevelData.level, "waterLevel")} drop-shadow-lg tracking-tight`}
					>
						{waterLevelData.level}%
					</div>
					<div className="space-y-2 mt-4">
						<div className="text-sm text-gray-500 font-medium capitalize">Status: {waterLevelData.status}</div>
						<div className="text-xs text-gray-500  px-3 py-1 ">
							{Math.round((waterLevelData.level / 100) * waterLevelData.capacity)}L / {waterLevelData.capacity}L
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
