import { Droplets, MapPin, Power, Send, Thermometer, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MqttClient } from "mqtt";
import { Button } from "@/components/ui/button";
import useSwitchSensor from "@/features/switch/hooks/useSwitchSensor";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}


export default function SwitchCard({ client, isConnected }: Props) {
	const { switchState, toggleSwitch } = useSwitchSensor({ client, isConnected })
	return (
		<Card className="border-2">
			<CardHeader>
				<div className="flex h-10 items-center justify-between">
					<div className="flex items-center gap-2">
						<Power className="h-5 w-5" />
						<div>
							<CardTitle>Switch Sensor</CardTitle>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="flex flex-col items-center space-y-6">
					<Button
						onClick={toggleSwitch}
						disabled={!isConnected}
						className={`size-20 rounded-full flex items-center justify-center
                                        ${switchState ? "bg-green-500" : "bg-red-500"}
                                `}>
						<Power className="h-6 w-6" />
					</Button>

				</div>
			</CardContent>
		</Card>

	)
}
