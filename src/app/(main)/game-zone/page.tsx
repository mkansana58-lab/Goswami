
"use client";

import { Gamepad2 } from "lucide-react";

export default function DeprecatedGameZonePage() {
    return (
        <div className="text-center py-10">
            <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Game Zone Removed</h2>
            <p className="text-muted-foreground">This feature has been removed to make way for new games and features!</p>
            <p className="text-muted-foreground">Please check the home page for new activities.</p>
        </div>
    );
}
