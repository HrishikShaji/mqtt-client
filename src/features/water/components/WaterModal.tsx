import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { WaterSensorType } from "@/types/sensor-types"
import { Droplets, Gauge, MapPin, Send, Settings2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Props {
	waterData: WaterSensorType;
	onChange: (field: string, value: any) => void;
	isConnected: boolean
}

const tankLocations = ["Main Tank", "Backup Tank", "Storage Tank", "Emergency Tank", "Roof Tank"]
const tankCapacities = [500, 750, 1000, 1500, 2000, 2500, 3000, 5000]

export default function WaterModal({ isConnected, waterData, onChange }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline"><Settings2 /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Water Level Sensor</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					{/* Water Level Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-2">
								<Gauge className="h-4 w-4" />
								Water Level
							</Label>
							<span className="text-sm font-medium">{waterData.level}%</span>
						</div>
						<Slider
							value={[waterData.level]}
							onValueChange={(value) => onChange("level", value[0])}
							max={100}
							min={0}
							step={1}
							disabled={!isConnected || !waterData.enabled}
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
							value={waterData.capacity.toString()}
							onValueChange={(value) => onChange("capacity", parseInt(value))}
							disabled={!isConnected || !waterData.enabled}
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
							value={waterData.status}
							onValueChange={(value) => onChange("status", value)}
							disabled={!isConnected || !waterData.enabled}
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

					{/* Location Dropdown */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Location
						</Label>
						<Select
							value={waterData.location}
							onValueChange={(value) => onChange("location", value)}
							disabled={!isConnected || !waterData.enabled}
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

					{/* Alerts Toggle */}
					<div className="flex items-center space-x-2">
						<Switch
							id="alerts"
							checked={waterData.alertsEnabled}
							onCheckedChange={(checked) => onChange("alertsEnabled", checked)}
							disabled={!isConnected || !waterData.enabled}
						/>
						<Label htmlFor="alerts">Low level alerts</Label>
					</div>

					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Send className="h-3 w-3" />
						<span>Auto-publishes to sensors/waterlevel</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
