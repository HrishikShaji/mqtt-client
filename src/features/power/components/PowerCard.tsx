"use client"

import { Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { MqttClient } from "mqtt"
import { formatValue } from "@/lib/utils"
import PowerModal from "./PowerModal"
import usePowerSensor from "@/features/power/hooks/usePowerSensor"

interface Props {
	client: MqttClient
	isConnected: boolean
}

export default function PowerCard({ client, isConnected }: Props) {
	const { powerData, handlePowerChange } = usePowerSensor({ client, isConnected })

	return (
		<Card className="relative rounded-4xl bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
			<CardHeader className="relative">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 ">
							<Zap className="h-5 w-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-white font-semibold">Power</CardTitle>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							className="cursor-pointer data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-black"
							checked={powerData.enabled}
							onCheckedChange={(checked) => handlePowerChange("enabled", checked)}
							disabled={!isConnected}
						/>
						<PowerModal onChange={handlePowerChange} isConnected={isConnected} powerData={powerData} />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 relative">
				<div className="text-center p-6 ">
					<div className="text-6xl font-semibold text-green-400 drop-shadow-lg tracking-tight">
						{formatValue(powerData.voltage)}V
					</div>
					<div className="text-sm text-gray-500 mt-3 capitalize font-medium">stable</div>
				</div>
			</CardContent>
		</Card>
	)
}
