import subprocess
from pathlib import Path
from pystray import Icon, MenuItem, Menu
from pynput import mouse
import tkinter as tk
from tkinter import simpledialog
import socket
import threading
import pystray
from PIL import Image
import os
import sys

class RetroArch_Remote:
    def __init__(self):
        self.default_ip = 'localhost'

#        icon_folder = os.path.join(sys._MEIPASS, 'test_dest')
#        image = Image.open(icon_folder+"/icon_dark.ico")
        image = Image.open('icon_dark.ico')
        self.icon = pystray.Icon('RetroArch_Remote', image, menu=self.create_menu())

        # Register mouse click listener
        self.mouse_listener = mouse.Listener(on_click=self.on_click)
        self.mouse_listener.start()

    def create_menu(self):
    # Create submenus dynamically       
        submenu_stateslots = Menu(
            MenuItem('Load Slot 0', lambda: self.action_custom('LOAD_STATE_SLOT 0')),
            MenuItem('Load Slot 1', lambda: self.action_custom('LOAD_STATE_SLOT 1')),
            MenuItem('Load Slot 2', lambda: self.action_custom('LOAD_STATE_SLOT 2')),
            MenuItem('Load Slot 3', lambda: self.action_custom('LOAD_STATE_SLOT 3')),
            MenuItem('Load Slot 4', lambda: self.action_custom('LOAD_STATE_SLOT 4')),
            MenuItem('Load Slot 5', lambda: self.action_custom('LOAD_STATE_SLOT 5')),
            MenuItem('Load Slot 6', lambda: self.action_custom('LOAD_STATE_SLOT 6')),
            MenuItem('Load Slot 7', lambda: self.action_custom('LOAD_STATE_SLOT 7')),
            MenuItem('Load Slot 8', lambda: self.action_custom('LOAD_STATE_SLOT 8')),
            MenuItem('Load Slot 9', lambda: self.action_custom('LOAD_STATE_SLOT 9')),
        )       
        submenu_replayslots = Menu(
            MenuItem('Play Input Log Slot 0', lambda: self.action_custom('PLAY_REPLAY_SLOT 0')),
            MenuItem('Play Input Log Slot 1', lambda: self.action_custom('PLAY_REPLAY_SLOT 1')),
            MenuItem('Play Input Log Slot 2', lambda: self.action_custom('PLAY_REPLAY_SLOT 2')),
            MenuItem('Play Input Log Slot 3', lambda: self.action_custom('PLAY_REPLAY_SLOT 3')),
            MenuItem('Play Input Log Slot 4', lambda: self.action_custom('PLAY_REPLAY_SLOT 4')),
            MenuItem('Play Input Log Slot 5', lambda: self.action_custom('PLAY_REPLAY_SLOT 5')),
            MenuItem('Play Input Log Slot 6', lambda: self.action_custom('PLAY_REPLAY_SLOT 6')),
            MenuItem('Play Input Log Slot 7', lambda: self.action_custom('PLAY_REPLAY_SLOT 7')),
            MenuItem('Play Input Log Slot 8', lambda: self.action_custom('PLAY_REPLAY_SLOT 8')),
            MenuItem('Play Input Log Slot 9', lambda: self.action_custom('PLAY_REPLAY_SLOT 9')),
        )
               
        submenu_input_recording = Menu(
            MenuItem('Start Input Log Rec', lambda: self.action_custom('RECORD_REPLAY')),
            MenuItem('Stop Input Log Rec', lambda: self.action_custom('HALT_REPLAY')),
            Menu.SEPARATOR,
            MenuItem('Play Input Log', lambda: self.action_custom('PLAY_REPLAY')),
            Menu.SEPARATOR,
            MenuItem('Next Input Log Slot', lambda: self.action_custom('REPLAY_SLOT_PLUS')),
            MenuItem('Prev. Input Log Slot', lambda: self.action_custom('REPLAY_SLOT_MINUS')),
            MenuItem('Play Specific Input Log Slot', submenu_replayslots)
        )
               
        submenu_video_recording = Menu(
            MenuItem('Video Record Start/Stop', lambda: self.action_custom('RECORDING_TOGGLE')),
            MenuItem('Video Streaming Start/Stop', lambda: self.action_custom('STREAMING_TOGGLE'))
        )
               
        submenu_recording = Menu(
            MenuItem('Take Screenshot', lambda: self.action_custom('SCREENSHOT')),
            Menu.SEPARATOR,
            MenuItem('Video Recording', submenu_video_recording),
            MenuItem('Input Log Rec/Playback', submenu_input_recording)
        )
               
        submenu_overlays = Menu(
            MenuItem('Show Next Overlay Layout', lambda: self.action_custom('OVERLAY_NEXT')),
            Menu.SEPARATOR,
            MenuItem('Onscreen Keyboard Overlay Show/Hide', lambda: self.action_custom('OSK'))
        )
               
        submenu_cheats = Menu(
            MenuItem('Cheats On/Off', lambda: self.action_custom('CHEAT_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Load Next Cheat', lambda: self.action_custom('CHEAT_INDEX_PLUS')),
            MenuItem('Load Prev. Cheat', lambda: self.action_custom('CHEAT_INDEX_MINUS'))
        )
               
        submenu_shaders = Menu(
            MenuItem('Shaders On/Off', lambda: self.action_custom('SHADER_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Load Next Shader', lambda: self.action_custom('SHADER_NEXT')),
            MenuItem('Load Prev. Shader', lambda: self.action_custom('SHADER_PREV'))
        )
              
        submenu_misc = Menu(
            MenuItem('AI Service Engage', lambda: self.action_custom('AI_SERVICE')),
            MenuItem('Shaders', submenu_shaders),
            MenuItem('Overlays', submenu_overlays),
            MenuItem('Cheats', submenu_cheats)
        )
              
        submenu_latency = Menu(
            MenuItem('Runahead On/Off', lambda: self.action_custom('RUNAHEAD_TOGGLE')),
            MenuItem('Preemptive Frames On/Off', lambda: self.action_custom('PREEMPT_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Gsync/Freesync On/Off', lambda: self.action_custom('VRR_RUNLOOP_TOGGLE')),
        )
              
        submenu_control = Menu(
            MenuItem('RetroArch Menu Toggle', lambda: self.action_custom('MENU_TOGGLE')),
            MenuItem('RetroArch Fullscreen Toggle', lambda: self.action_custom('FULLSCREEN_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Soft Reset Content', lambda: self.action_custom('RESET')),
            MenuItem('Close Content', lambda: self.action_custom('CLOSE_CONTENT')),
            Menu.SEPARATOR,
            MenuItem('FPS Display On/Off', lambda: self.action_custom('FPS_TOGGLE')),
            MenuItem('Statistics Display On/Off', lambda: self.action_custom('STATISTICS_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Capture Mouse', lambda: self.action_custom('GRAB_MOUSE_TOGGLE')),
            MenuItem('Game Focus Mode', lambda: self.action_custom('GAME_FOCUS_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Quit RetroArch', self.sequence_quit)
        )
                
        submenu_netplay = Menu(
            MenuItem('Hosting On/Off', lambda: self.action_custom('NETPLAY_HOST_TOGGLE')),
            MenuItem('Ping On/Off', lambda: self.action_custom('NETPLAY_PING_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Chat Focus On/Off', lambda: self.action_custom('NETPLAY_PLAYER_CHAT')),
            MenuItem('Chat Fade In/Out', lambda: self.action_custom('NETPLAY_FADE_CHAT_TOGGLE')),
            Menu.SEPARATOR,
            MenuItem('Spectate Game', lambda: self.action_custom('NETLAY_GAME_WATCH'))
        )
                
        submenu_frame_throttle = Menu(
            MenuItem('Pause/Resume', lambda: self.action_custom('PAUSE_TOGGLE')),
            MenuItem('Frame Advance', lambda: self.action_custom('FRAMEADVANCE')),
            Menu.SEPARATOR,
            MenuItem('Rewind On/Off', lambda: self.action_custom('REWIND')),
            MenuItem('Fast-Forward On/Off', lambda: self.action_custom('FAST_FORWARD')),
            MenuItem('Slow Motion On/Off', lambda: self.action_custom('SLOWMOTION'))
        )
        
        submenu_savestates = Menu(
            MenuItem('Save State', lambda: self.action_custom('SAVE_STATE')),
            MenuItem('Load State', lambda: self.action_custom('LOAD_STATE')),
            Menu.SEPARATOR,
            MenuItem('Next State Slot', lambda: self.action_custom('STATE_SLOT_PLUS')),
            MenuItem('Prev. State Slot', lambda: self.action_custom('STATE_SLOT_MINUS')),
            Menu.SEPARATOR,
            MenuItem('Load Specific State Slot', submenu_stateslots),
        )
        
        submenu_main = Menu(
            MenuItem('RetroArch Control', submenu_control),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Load Next Disc', self.sequence_next_disc),
            MenuItem('Load Prev. Disc', self.sequence_prev_disc),
            Menu.SEPARATOR,
            MenuItem('Savestates', submenu_savestates),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Recording', submenu_recording),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Frame Throttle', submenu_frame_throttle),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Latency Reduction', submenu_latency),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Netplay', submenu_netplay),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Miscellaneous', submenu_misc),  # Using a submenu here
            Menu.SEPARATOR,
            MenuItem('Set RetroArch Host IP', self.set_ip_address),
            MenuItem('Quit RetroArch Remote', lambda: self.icon.stop())
        )

        return submenu_main

    def run(self):
        # Run the application and display the icon in the system tray
        self.icon.run()

    def on_click(self, x, y, button, pressed):
        if pressed and button == mouse.Button.left:
            pass  # Left-click does nothing by default

    def get_ip_address(self):
        root = tk.Tk()
        root.withdraw()  # Hide main window

        ip_address = simpledialog.askstring("Enter IP Address", "Please enter the IP address (default is localhost):", initialvalue=self.default_ip)
        root.destroy()  # Destroy the tkinter instance after input is obtained

        if ip_address:
            self.default_ip = ip_address  # Update default IP if user provided one

        return ip_address if ip_address else self.default_ip

    def action_custom(self, command):
        ip_address = self.default_ip
        if ip_address:
            self.send_udp_command(ip_address, command)

    def send_udp_command(self, ip_address, command):
        # Create a UDP socket
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            command_bytes = command.encode('utf-8')  # Convert command to bytes
            port = 55355  # Port number
            timeout = 1  # Timeout in seconds
            sock.settimeout(timeout)
            try:
                sock.sendto(command_bytes, (ip_address, port))
            except socket.timeout:
                print(f"Socket timeout while sending command '{command}' to {ip_address}")

    def set_ip_address(self):
        ip_address = self.get_ip_address()
        # No need to do anything else here as IP address is updated in get_ip_address()
        
    def sequence_next_disc(self):
        # Example method for executing a sequence of custom actions with a delay between them
        actions = ['DISK_EJECT_TOGGLE', 'DISK_NEXT', 'DISK_EJECT_TOGGLE']  # List of commands
        delay = 1  # Delay in seconds between actions

        def execute_action_with_delay(command, delay):
            threading.Timer(delay, self.action_custom, args=[command]).start()

        for i, action in enumerate(actions):
            execute_action_with_delay(action, (i + 1) * delay)
        
    def sequence_prev_disc(self):
        # Example method for executing a sequence of custom actions with a delay between them
        actions = ['DISK_EJECT_TOGGLE', 'DISK_PREV', 'DISK_EJECT_TOGGLE']  # List of commands
        delay = 1  # Delay in seconds between actions

        def execute_action_with_delay(command, delay):
            threading.Timer(delay, self.action_custom, args=[command]).start()

        for i, action in enumerate(actions):
            execute_action_with_delay(action, (i + 1) * delay)
        
    def sequence_quit(self):
        # Example method for executing a sequence of custom actions with a delay between them
        actions = ['QUIT', 'QUIT']  # List of commands
        delay = 1  # Delay in seconds between actions

        def execute_action_with_delay(command, delay):
            threading.Timer(delay, self.action_custom, args=[command]).start()

        for i, action in enumerate(actions):
            execute_action_with_delay(action, (i + 1) * delay)

if __name__ == "__main__":
    app = RetroArch_Remote()
    app.run()
    pystray.Icon.run()
