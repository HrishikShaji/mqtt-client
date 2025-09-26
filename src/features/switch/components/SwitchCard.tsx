"use client"

import { Power } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MqttClient } from "mqtt"
import { Button } from "@/components/ui/button"
import useSwitchSensor from "@/features/switch/hooks/useSwitchSensor"

interface Props {
	client: MqttClient
	isConnected: boolean
}

export default function SwitchCard({ client, isConnected }: Props) {
	const { switchState, toggleSwitch } = useSwitchSensor({ client, isConnected })
	return (
		<Card className="relative rounded-4xl  bg-black/20 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
			<CardHeader className="relative">
				<div className="flex h-10 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-lg  ">
							<Power className="h-5 w-5 text-white drop-shadow-sm" />
						</div>
						<div>
							<CardTitle className="text-white font-semibold">Switch</CardTitle>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-8 relative">
				<div className="flex flex-col items-center space-y-6">
					<div className="relative">
						<Button
							onClick={toggleSwitch}
							disabled={!isConnected}
							className={`size-24 rounded-full flex cursor-pointer items-center justify-center transition-all duration-300 backdrop-blur-sm border-2 shadow-2xl
								${switchState
									? "bg-green-400 border-green-400/50 text-black shadow-green-500/20"
									: "bg-red-400 border-red-400/50 text-black shadow-red-500/20"
								}
								hover:scale-105 active:scale-95
							`}
						>
							<Power className="h-8 w-8 drop-shadow-lg" />
						</Button>
						{/* {switchState && <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" />} */}
					</div>
					<div className="text-center">
						<div
							className={`text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm border
							${switchState
									? "bg-green-400 border-green-400/30 text-black"
									: "bg-red-400 border-red-400/30 text-black"
								}
						`}
						>
							{switchState ? "ON" : "OFF"}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
