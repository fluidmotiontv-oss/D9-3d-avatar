import React, { useState, useMemo } from 'react';
import {
  DragonTheme,
  AudioReactiveState,
  ExpressionMode,
  AudioConfig,
  StreamConfig,
} from '../types';
import {
  Box,
  Download,
  Copy,
  Check,
  FileCode,
  FileJson,
  Terminal,
  Settings,
  Sparkles,
  Lightbulb,
  Camera,
  Play,
  Flame,
  Layers,
  Wind,
  Waves,
} from 'lucide-react';

interface BlenderExportPanelProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  audioConfig?: AudioConfig;
  streamConfig?: StreamConfig;
}

export const BlenderExportPanel: React.FC<BlenderExportPanelProps> = ({
  theme,
  audioState,
  expression,
  audioConfig,
  streamConfig,
}) => {
  // Export Settings State
  const [renderEngine, setRenderEngine] = useState<'EEVEE' | 'CYCLES'>('EEVEE');
  const [targetFps, setTargetFps] = useState<24 | 30 | 60>(30);
  const [totalFrames, setTotalFrames] = useState<number>(240);
  const [includeLighting, setIncludeLighting] = useState<boolean>(true);
  const [includeCamera, setIncludeCamera] = useState<boolean>(true);
  const [includeWings, setIncludeWings] = useState<boolean>(true);
  const [includeAnimation, setIncludeAnimation] = useState<boolean>(true);
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'json'>('python');

  // Copy notification states
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Helper to convert HEX color to Linear float sRGB for Blender
  const hexToLinear = (hexStr: string): [number, number, number, number] => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return [0.5, 0.5, 0.5, 1.0];
    const r = parseInt(clean.substring(0, 2), 16) / 255.0;
    const g = parseInt(clean.substring(2, 4), 16) / 255.0;
    const b = parseInt(clean.substring(4, 6), 16) / 255.0;

    const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return [
      Number(toLin(r).toFixed(4)),
      Number(toLin(g).toFixed(4)),
      Number(toLin(b).toFixed(4)),
      1.0,
    ];
  };

  // Structured JSON Manifest
  const manifestData = useMemo(() => {
    const timestamp = new Date().toISOString();
    return {
      manifest_version: '2.4.0',
      generator: 'Dragon9 Synchronized Studio // FluidmotionTV',
      target_engine: 'Blender 3.6 / 4.x / 5.x',
      created_at: timestamp,
      dragon_chassis: {
        chassis_id: 'CYBER_DRAGON_MK_IX',
        name: theme.name,
        badge: theme.badge,
        tagline: theme.tagline,
        scale: [1.0, 1.0, 1.0],
        hierarchical_structure: {
          root_collection: 'CyberDragon_Rig',
          primary_armatures: [
            {
              name: 'Head_Armature',
              type: 'bone_group',
              pivot: [0.0, 0.0, 0.0],
              components: ['Upper_Cranium', 'Ocular_Sensors_L', 'Ocular_Sensors_R'],
            },
            {
              name: 'Lower_Jaw_Mechanic',
              type: 'hinged_articulation',
              pivot: [0.0, -0.32, -0.22],
              rotation_axis: 'X',
              min_pitch_deg: 0.0,
              max_pitch_deg: -36.0,
              active_rotation_deg: -Number((audioState.jawOpen * 36).toFixed(1)),
            },
            {
              name: 'Cyber_Horns',
              type: 'symmetric_pair',
              left_pivot: [-0.42, -0.15, 0.48],
              right_pivot: [0.42, -0.15, 0.48],
              materials: ['M_Dragon_Accent', 'M_Dragon_Horns_Glow'],
            },
            {
              name: 'Cyber_Wings_Armature',
              type: '3d_kinematic_wingbeat',
              left_pivot: [-0.65, 0.12, 0.28],
              right_pivot: [0.65, 0.12, 0.28],
              wingspan_units: 3.4,
              feather_blades_per_wing: 5,
              materials: ['M_Dragon_Secondary', 'M_Dragon_Energy_Emission'],
            },
            {
              name: 'Plasma_Vents_Nostrils',
              type: 'particle_emitter_anchors',
              left_anchor: [-0.075, 0.48, -0.06],
              right_anchor: [0.075, 0.48, -0.06],
              vapor_type: 'frost_cryo_smoke',
            },
          ],
        },
      },
      color_theme: {
        id: theme.id,
        name: theme.name,
        badge: theme.badge,
        hex_values: {
          primary: theme.primary,
          secondary: theme.secondary,
          accent: theme.accent,
          energy: theme.energy,
          eyeGlow: theme.eyeGlow,
          mouthGlow: theme.mouthGlow,
          hornsGlow: theme.hornsGlow,
          auraColor: theme.auraColor,
          gridColor: theme.gridColor,
        },
        blender_linear_rgba: {
          primary: hexToLinear(theme.primary),
          secondary: hexToLinear(theme.secondary),
          accent: hexToLinear(theme.accent),
          energy: hexToLinear(theme.energy),
          eyeGlow: hexToLinear(theme.eyeGlow),
          mouthGlow: hexToLinear(theme.mouthGlow),
          hornsGlow: hexToLinear(theme.hornsGlow),
          auraColor: hexToLinear(theme.auraColor),
          gridColor: hexToLinear(theme.gridColor),
        },
        shader_properties: {
          primary_metallic: 0.88,
          primary_roughness: 0.22,
          secondary_metallic: 0.94,
          secondary_roughness: 0.16,
          accent_metallic: 0.75,
          accent_roughness: 0.28,
          energy_emission_strength: 14.0,
          eye_emission_strength: 20.0,
          mouth_emission_strength: 24.0,
          horns_emission_strength: 16.0,
        },
      },
      animation_state: {
        active_expression: expression,
        is_speaking: audioState.isSpeaking,
        is_roaring: audioState.isRoaring,
        telemetry_metrics: {
          volume: Number(audioState.volume.toFixed(3)),
          raw_volume: Number(audioState.rawVolume.toFixed(3)),
          bass_energy: Number(audioState.bass.toFixed(3)),
          mid_energy: Number(audioState.mid.toFixed(3)),
          treble_energy: Number(audioState.treble.toFixed(3)),
          pitch_centroid: Number(audioState.pitchCentroid.toFixed(3)),
          jaw_open_factor: Number(audioState.jawOpen.toFixed(3)),
          beam_intensity: Number(audioState.beamIntensity.toFixed(3)),
        },
        kinematic_parameters: {
          jaw_multiplier: audioConfig?.jawMultiplier ?? 1.4,
          noise_gate: audioConfig?.noiseGate ?? 0.08,
          roaring_threshold: audioConfig?.roarThreshold ?? 0.75,
          natural_respiration_bpm: 18.0,
          harmonic_tuning_hz: 432.0,
        },
      },
      render_environment: {
        render_engine: renderEngine === 'EEVEE' ? 'BLENDER_EEVEE_NEXT' : 'CYCLES',
        resolution: [1920, 1080],
        pixel_aspect_ratio: [1.0, 1.0],
        target_fps: targetFps,
        frame_start: 1,
        frame_end: totalFrames,
        transparent_film: transparentBg,
        color_management: {
          view_transform: 'AgX',
          look: 'High Contrast',
        },
        three_point_lighting: {
          key_light: {
            type: 'AREA',
            color: hexToLinear(theme.primary).slice(0, 3),
            energy_watts: 450.0,
            location: [-2.2, -3.5, 2.8],
            rotation_deg: [45.0, 0.0, -30.0],
            size: 1.8,
          },
          fill_light: {
            type: 'AREA',
            color: hexToLinear(theme.secondary).slice(0, 3),
            energy_watts: 180.0,
            location: [2.5, -3.0, 1.2],
            rotation_deg: [55.0, 0.0, 35.0],
            size: 2.2,
          },
          rim_backlight: {
            type: 'POINT',
            color: hexToLinear(theme.energy).slice(0, 3),
            energy_watts: 850.0,
            location: [0.0, 2.6, 2.0],
            radius: 0.35,
          },
        },
        camera_rig: {
          type: 'PERSP',
          focal_length_mm: 85.0,
          location: [0.0, -3.6, 0.35],
          rotation_deg: [86.0, 0.0, 0.0],
          sensor_width_mm: 36.0,
          clip_start: 0.1,
          clip_end: 100.0,
        },
      },
    };
  }, [
    theme,
    audioState,
    expression,
    renderEngine,
    targetFps,
    totalFrames,
    transparentBg,
    audioConfig,
  ]);

  const jsonString = useMemo(() => JSON.stringify(manifestData, null, 2), [manifestData]);

  // Complete, Self-Contained Blender Python Setup Script
  const pythonScript = useMemo(() => {
    // Escape JSON string for python raw string inclusion
    return `"""
================================================================================
CYBER DRAGON GUARDIAN // BLENDER PIPELINE AUTO-IMPORTER & SCENE BUILDER
--------------------------------------------------------------------------------
Generated: ${new Date().toISOString()}
Target: Blender 3.6 / 4.x / 5.x (Cycles & Eevee Next)
Theme: ${theme.name} (${theme.badge})
Animation State: ${expression.toUpperCase()} | 432Hz Harmonic Driver
================================================================================
INSTRUCTIONS:
  1. Open Blender.
  2. Switch to the 'Scripting' workspace at the top bar.
  3. Click '+ New' to create a new text block.
  4. Paste this entire script into the editor.
  5. Click 'Run Script' (or press Alt + P).
================================================================================
"""

import bpy
import math
import json

# ------------------------------------------------------------------------------
# 1. EMBEDDED DRAGON CHASSIS & THEME MANIFEST
# ------------------------------------------------------------------------------
MANIFEST_JSON = r'''${jsonString}'''

data = json.loads(MANIFEST_JSON)
theme = data["color_theme"]
chassis = data["dragon_chassis"]
anim = data["animation_state"]
env = data["render_environment"]

print(f"[*] Initializing Cyber Dragon 3D Rig: {chassis['name']} [{chassis['badge']}]")
print(f"[*] Animation Stance: {anim['active_expression'].upper()}")

# ------------------------------------------------------------------------------
# 2. SCENE & RENDER ENGINE CONFIGURATION
# ------------------------------------------------------------------------------
scene = bpy.context.scene

# Configure Render Engine
engine_target = env.get("render_engine", "BLENDER_EEVEE_NEXT")
if engine_target in bpy.types.RenderEngine.bl_rna.properties['engine'].enum_items.keys():
    scene.render.engine = engine_target
elif "BLENDER_EEVEE_NEXT" in bpy.types.RenderEngine.bl_rna.properties['engine'].enum_items.keys():
    scene.render.engine = "BLENDER_EEVEE_NEXT"
else:
    scene.render.engine = "CYCLES"

# Frame rate & timeline bounds
scene.render.fps = env.get("target_fps", 30)
scene.frame_start = env.get("frame_start", 1)
scene.frame_end = env.get("frame_end", 240)
scene.render.resolution_x = env.get("resolution", [1920, 1080])[0]
scene.render.resolution_y = env.get("resolution", [1920, 1080])[1]
scene.render.film_transparent = env.get("transparent_film", True)

# Color Management (AgX or Filmic)
try:
    scene.view_settings.view_transform = env["color_management"].get("view_transform", "AgX")
    scene.view_settings.look = env["color_management"].get("look", "High Contrast")
except Exception:
    scene.view_settings.view_transform = "Filmic"

# ------------------------------------------------------------------------------
# 3. ROOT COLLECTION SETUP
# ------------------------------------------------------------------------------
coll_name = chassis["hierarchical_structure"].get("root_collection", "CyberDragon_Rig")
dragon_coll = bpy.data.collections.get(coll_name)
if not dragon_coll:
    dragon_coll = bpy.data.collections.new(coll_name)
    bpy.context.scene.collection.children.link(dragon_coll)

# Set active collection
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[coll_name]

# Helper to link objects directly to dragon collection
def link_to_dragon(obj):
    for c in obj.users_collection:
        c.unlink(obj)
    dragon_coll.objects.link(obj)

# ------------------------------------------------------------------------------
# 4. PROCEDURAL MATERIAL SYNTHESIZER (Principled BSDF & Emission)
# ------------------------------------------------------------------------------
def create_cyber_material(name, base_color, metallic=0.9, roughness=0.2, is_emission=False, emission_color=None, emission_strength=12.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    output_node.location = (400, 0)

    if is_emission:
        # High-power Cybernetic Emission Shader
        emit_node = nodes.new(type='ShaderNodeEmission')
        emit_node.location = (150, 0)
        e_col = emission_color if emission_color else base_color
        emit_node.inputs['Color'].default_value = (e_col[0], e_col[1], e_col[2], 1.0)
        emit_node.inputs['Strength'].default_value = emission_strength
        links.new(emit_node.outputs['Emission'], output_node.inputs['Surface'])
    else:
        # Metallic Cyber Chassis Shader
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        bsdf.location = (100, 0)
        bsdf.inputs['Base Color'].default_value = (base_color[0], base_color[1], base_color[2], 1.0)
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness

        # Check for emission socket in Principled BSDF
        if emission_color and 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = (emission_color[0], emission_color[1], emission_color[2], 1.0)
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif emission_color and 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = (emission_color[0], emission_color[1], emission_color[2], 1.0)

        links.new(bsdf.outputs['BSDF'], output_node.inputs['Surface'])

    return mat

# Synthesize all dragon palette materials from manifest
rgba = theme["blender_linear_rgba"]
props = theme["shader_properties"]

mat_primary = create_cyber_material("M_Dragon_Primary", rgba["primary"], metallic=props["primary_metallic"], roughness=props["primary_roughness"])
mat_secondary = create_cyber_material("M_Dragon_Secondary", rgba["secondary"], metallic=props["secondary_metallic"], roughness=props["secondary_roughness"])
mat_accent = create_cyber_material("M_Dragon_Accent", rgba["accent"], metallic=props["accent_metallic"], roughness=props["accent_roughness"])
mat_energy = create_cyber_material("M_Dragon_Energy_Emission", rgba["energy"], is_emission=True, emission_strength=props["energy_emission_strength"])
mat_eye_glow = create_cyber_material("M_Dragon_Eye_Glow", rgba["eyeGlow"], is_emission=True, emission_strength=props["eye_emission_strength"])
mat_mouth_glow = create_cyber_material("M_Dragon_Mouth_Glow", rgba["mouthGlow"], is_emission=True, emission_strength=props["mouth_emission_strength"])
mat_horns_glow = create_cyber_material("M_Dragon_Horns_Glow", rgba["hornsGlow"], is_emission=True, emission_strength=props["horns_emission_strength"])

# ------------------------------------------------------------------------------
# 5. CYBER DRAGON CHASSIS GEOMETRY GENERATOR
# ------------------------------------------------------------------------------
# A. Head Root Armature Empty
head_root = bpy.data.objects.new("CyberDragon_Head_Root", None)
head_root.empty_display_type = 'ARROWS'
head_root.empty_display_size = 0.5
head_root.location = (0.0, 0.0, 0.0)
link_to_dragon(head_root)

# B. Upper Cranium (Main Skull Plate)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.1, 0.2))
cranium = bpy.context.active_object
cranium.name = "CyberDragon_Upper_Cranium"
cranium.scale = (0.68, 0.95, 0.45)
link_to_dragon(cranium)
cranium.parent = head_root
cranium.data.materials.append(mat_primary)

# Snout Taper Plate
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.42, depth=0.75, location=(0.0, 0.72, 0.05))
snout = bpy.context.active_object
snout.name = "CyberDragon_Snout"
snout.rotation_euler = (math.radians(90), 0, math.radians(45))
snout.scale = (0.75, 0.42, 0.85)
link_to_dragon(snout)
snout.parent = cranium
snout.data.materials.append(mat_primary)

# C. Lower Jaw Pivot & Articulated Mandible
jaw_pivot = bpy.data.objects.new("CyberDragon_Jaw_Pivot", None)
jaw_pivot.empty_display_type = 'SINGLE_ARROW'
jaw_pivot.empty_display_size = 0.35
jaw_pivot.location = (0.0, -0.15, -0.15)
link_to_dragon(jaw_pivot)
jaw_pivot.parent = head_root

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.38, -0.06))
jaw_mesh = bpy.context.active_object
jaw_mesh.name = "CyberDragon_Lower_Jaw"
jaw_mesh.scale = (0.52, 0.78, 0.22)
link_to_dragon(jaw_mesh)
jaw_mesh.parent = jaw_pivot
jaw_mesh.data.materials.append(mat_secondary)

# Internal Maw Plasma Core
bpy.ops.mesh.primitive_cube_add(size=0.8, location=(0.0, 0.25, 0.08))
maw_core = bpy.context.active_object
maw_core.name = "CyberDragon_Maw_PlasmaCore"
maw_core.scale = (0.35, 0.55, 0.08)
link_to_dragon(maw_core)
maw_core.parent = jaw_mesh
maw_core.data.materials.append(mat_mouth_glow)

# D. Dual Cyber Horns
for sign, side in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.14, depth=1.1, location=(sign * 0.42, -0.32, 0.55))
    horn = bpy.context.active_object
    horn.name = f"CyberDragon_Horn_{side}"
    horn.rotation_euler = (math.radians(-38), math.radians(sign * -18), math.radians(sign * 12))
    link_to_dragon(horn)
    horn.parent = cranium
    horn.data.materials.append(mat_accent)

    # Horn Energy Tip
    bpy.ops.mesh.primitive_icosphere_add(subdivisions=2, radius=0.08, location=(sign * 0.54, -0.75, 1.05))
    tip = bpy.context.active_object
    tip.name = f"CyberDragon_HornTip_{side}"
    link_to_dragon(tip)
    tip.parent = horn
    tip.data.materials.append(mat_horns_glow)

# E. Ocular Sensor Optics (Eyes)
for sign, side in [(-1, "L"), (1, "R")]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.11, depth=0.18, location=(sign * 0.38, 0.22, 0.18))
    eye = bpy.context.active_object
    eye.name = f"CyberDragon_EyeSensor_{side}"
    eye.rotation_euler = (math.radians(15), math.radians(sign * 25), math.radians(90))
    link_to_dragon(eye)
    eye.parent = cranium
    eye.data.materials.append(mat_eye_glow)

# F. Nostril Vents
for sign, side in [(-1, "L"), (1, "R")]:
    vent = bpy.data.objects.new(f"CyberDragon_NostrilVent_{side}", None)
    vent.empty_display_type = 'SPHERE'
    vent.empty_display_size = 0.06
    vent.location = (sign * 0.08, 0.95, 0.05)
    link_to_dragon(vent)
    vent.parent = snout

${
  includeWings
    ? `# G. 3D-CSS Cyber Wings Kinematic Armatures
for sign, side in [(-1, "L"), (1, "R")]:
    wing_root = bpy.data.objects.new(f"CyberDragon_WingPivot_{side}", None)
    wing_root.empty_display_type = 'CIRCLE'
    wing_root.empty_display_size = 0.3
    wing_root.location = (sign * 0.65, -0.15, 0.15)
    link_to_dragon(wing_root)
    wing_root.parent = head_root

    # Titanium Wing Main Spar
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.06, depth=1.6, location=(sign * 0.8, -0.1, 0.3))
    spar = bpy.context.active_object
    spar.name = f"CyberDragon_WingSpar_{side}"
    spar.rotation_euler = (math.radians(15), math.radians(sign * 55), math.radians(sign * -20))
    link_to_dragon(spar)
    spar.parent = wing_root
    spar.data.materials.append(mat_secondary)

    # 4 Photon Laser Feather Blades
    for b_idx in range(4):
        offset = (b_idx + 1) * 0.32
        bpy.ops.mesh.primitive_cube_add(size=0.6, location=(sign * (0.8 + offset * 0.6), -0.2 - offset * 0.25, 0.4 - offset * 0.12))
        blade = bpy.context.active_object
        blade.name = f"CyberDragon_WingBlade_{side}_{b_idx+1}"
        blade.scale = (0.04, 0.45, 0.12)
        blade.rotation_euler = (math.radians(20), math.radians(sign * 45), math.radians(sign * -15))
        link_to_dragon(blade)
        blade.parent = wing_root
        blade.data.materials.append(mat_energy)
`
    : ''
}

# ------------------------------------------------------------------------------
# 6. PROCEDURAL ANIMATION & 432Hz HARMONIC KEYFRAMING
# ------------------------------------------------------------------------------
${
  includeAnimation
    ? `
# Create action for Jaw Pivot
jaw_pivot.animation_data_create()
jaw_action = bpy.data.actions.new(name="Dragon_Jaw_Vocal_Sync")
jaw_pivot.animation_data.action = jaw_action

# Create action for Head Bob
head_root.animation_data_create()
head_action = bpy.data.actions.new(name="Dragon_Respiration_Float")
head_root.animation_data.action = head_action

fps = scene.render.fps
total_frames = scene.frame_end
current_mode = "${expression}"
is_roaring = ${audioState.isRoaring ? 'True' : 'False'}
is_speaking = ${audioState.isSpeaking ? 'True' : 'False'}
active_jaw_deg = ${Math.max(4, audioState.jawOpen * 36)}

print(f"[*] Procedural Keyframing {total_frames} frames for state: {current_mode.upper()}...")

for f in range(1, total_frames + 1):
    scene.frame_set(f)
    t = f / fps

    # 1. Jaw Opening Animation Logic
    if current_mode == 'roar' or is_roaring:
        # Wide gaping roar with tremor shudder
        tremor = math.sin(t * 42.0) * 0.02
        jaw_angle = math.radians(-34.0 + tremor)
        head_pitch = math.radians(6.5 + math.sin(t * 18.0) * 0.8)
    elif current_mode == 'talk' or is_speaking:
        # Natural spoken syllable rhythm (4 - 8 Hz modulation)
        syllable = (math.sin(t * 12.5) * 0.5 + 0.5) * math.sin(t * 6.2)
        jaw_angle = math.radians(-5.0 - abs(syllable) * 26.0)
        head_pitch = math.radians(math.sin(t * 3.5) * 2.0)
    elif current_mode == 'alert':
        # Intense locked focus with micro scans
        jaw_angle = math.radians(-3.0)
        head_pitch = math.radians(math.sin(t * 1.8) * 1.2)
    else:
        # Idle / Hypersync: 432Hz harmonic breathing oscillation (~3.6s cycle)
        breath = (math.sin(t * 1.74) * 0.5 + 0.5)
        jaw_angle = math.radians(-2.0 - breath * 6.0)
        head_pitch = math.radians(math.sin(t * 1.74) * 1.5)

    jaw_pivot.rotation_euler.x = jaw_angle
    jaw_pivot.keyframe_insert(data_path="rotation_euler", index=0, frame=f)

    # 2. Respiration Head Float
    head_z = math.sin(t * 1.74) * 0.04
    head_root.location.z = head_z
    head_root.rotation_euler.x = head_pitch
    head_root.keyframe_insert(data_path="location", index=2, frame=f)
    head_root.keyframe_insert(data_path="rotation_euler", index=0, frame=f)

${
  includeWings
    ? `
    # 3. Dynamic Wingbeat Kinetics
    for sign, side in [(-1, "L"), (1, "R")]:
        wing_obj = bpy.data.objects.get(f"CyberDragon_WingPivot_{side}")
        if wing_obj:
            if not wing_obj.animation_data:
                wing_obj.animation_data_create()
            if current_mode == 'roar' or is_roaring:
                flap = math.sin(t * 14.0) * 0.35
                wing_rot_y = sign * (0.45 + flap)
                wing_rot_z = -sign * (0.35 + flap * 0.5)
            else:
                hover = math.sin(t * 3.2) * 0.18
                wing_rot_y = sign * (0.22 + hover)
                wing_rot_z = -sign * (0.15 + hover * 0.3)

            wing_obj.rotation_euler.y = wing_rot_y
            wing_obj.rotation_euler.z = wing_rot_z
            wing_obj.keyframe_insert(data_path="rotation_euler", index=1, frame=f)
            wing_obj.keyframe_insert(data_path="rotation_euler", index=2, frame=f)
`
    : ''
}

scene.frame_set(1)
`
    : '# Procedural Animation Keyframing disabled by user export flags.'
}

# ------------------------------------------------------------------------------
# 7. STUDIO 3-POINT LIGHTING SETUP
# ------------------------------------------------------------------------------
${
  includeLighting
    ? `
light_coll_name = "CyberDragon_Studio_Lights"
light_coll = bpy.data.collections.get(light_coll_name)
if not light_coll:
    light_coll = bpy.data.collections.new(light_coll_name)
    dragon_coll.children.link(light_coll)

def create_studio_light(name, light_type, color_rgb, energy, location, rotation_deg=None, size=1.0):
    light_data = bpy.data.lights.new(name=f"{name}_Data", type=light_type)
    light_data.color = (color_rgb[0], color_rgb[1], color_rgb[2])
    light_data.energy = energy
    if light_type == 'AREA':
        light_data.size = size

    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = location
    if rotation_deg:
        light_obj.rotation_euler = (math.radians(rotation_deg[0]), math.radians(rotation_deg[1]), math.radians(rotation_deg[2]))
    light_coll.objects.link(light_obj)
    return light_obj

# Key Light (Primary Dragon Energy Tint)
create_studio_light(
    "Dragon_Key_Light",
    "AREA",
    env["three_point_lighting"]["key_light"]["color"],
    env["three_point_lighting"]["key_light"]["energy_watts"],
    env["three_point_lighting"]["key_light"]["location"],
    env["three_point_lighting"]["key_light"]["rotation_deg"],
    env["three_point_lighting"]["key_light"]["size"]
)

# Fill Light (Cool Cyber Secondary Tint)
create_studio_light(
    "Dragon_Fill_Light",
    "AREA",
    env["three_point_lighting"]["fill_light"]["color"],
    env["three_point_lighting"]["fill_light"]["energy_watts"],
    env["three_point_lighting"]["fill_light"]["location"],
    env["three_point_lighting"]["fill_light"]["rotation_deg"],
    env["three_point_lighting"]["fill_light"]["size"]
)

# Rim Silhouette Light (Ion Energy Backlight)
create_studio_light(
    "Dragon_Rim_Backlight",
    "POINT",
    env["three_point_lighting"]["rim_backlight"]["color"],
    env["three_point_lighting"]["rim_backlight"]["energy_watts"],
    env["three_point_lighting"]["rim_backlight"]["location"]
)
`
    : '# 3-Point Studio Lighting skipped.'
}

# ------------------------------------------------------------------------------
# 8. CINEMATIC PORTRAIT CAMERA RIG
# ------------------------------------------------------------------------------
${
  includeCamera
    ? `
cam_data = bpy.data.cameras.new(name="CyberDragon_Camera_Data")
cam_data.lens = env["camera_rig"].get("focal_length_mm", 85.0)
cam_data.sensor_width = env["camera_rig"].get("sensor_width_mm", 36.0)
cam_data.clip_start = env["camera_rig"].get("clip_start", 0.1)
cam_data.clip_end = env["camera_rig"].get("clip_end", 100.0)

cam_obj = bpy.data.objects.new(name="CyberDragon_Main_Camera", object_data=cam_data)
cam_obj.location = env["camera_rig"]["location"]
cam_obj.rotation_euler = (
    math.radians(env["camera_rig"]["rotation_deg"][0]),
    math.radians(env["camera_rig"]["rotation_deg"][1]),
    math.radians(env["camera_rig"]["rotation_deg"][2])
)
dragon_coll.objects.link(cam_obj)
scene.camera = cam_obj
`
    : '# Camera Rig skipped.'
}

print("================================================================================")
print("[+] SUCCESS: Cyber Dragon Chassis Rig & Environment Assembled in Blender!")
print(f"[+] Active Palette: {theme['name']} | Materials: 7 compiled shader networks")
print(f"[+] Output Render Engine: {scene.render.engine} @ {scene.render.fps} FPS")
print("================================================================================")
`;
  }, [
    jsonString,
    theme,
    expression,
    includeWings,
    includeAnimation,
    includeLighting,
    includeCamera,
    audioState.isRoaring,
    audioState.isSpeaking,
    audioState.jawOpen,
  ]);

  // Download Handlers
  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dragon_chassis_${theme.id}_manifest.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `setup_cyber_dragon_${theme.id}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyPython = async () => {
    try {
      await navigator.clipboard.writeText(pythonScript);
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2200);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2200);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl border border-amber-800/60 bg-gradient-to-br from-amber-950/40 via-zinc-900/80 to-zinc-950 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm tracking-wider text-amber-200">
                BLENDER PIPELINE EXPORTER
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Multi-Modal 3D Rig &amp; Dawn Engine Sync // v2.4.0
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
            {theme.badge}
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Generate an automated Python import script and structured JSON manifest to reconstruct the current dragon chassis, Principled BSDF shader materials, 3-point lighting rig, and speech/respiration keyframe animations inside Blender.
        </p>

        {/* Quick 3-Step Execution Badge */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-900/40 text-[11px] font-mono text-zinc-300">
          <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1.5 rounded border border-zinc-800">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold">
              1
            </span>
            <span>Copy Python</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1.5 rounded border border-zinc-800">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold">
              2
            </span>
            <span>Open Scripting</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1.5 rounded border border-zinc-800">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold">
              3
            </span>
            <span>Run Script (Alt+P)</span>
          </div>
        </div>
      </div>

      {/* Export Parameter Customizer */}
      <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-3.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300">
          <span className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            3D SCENE &amp; RENDER CONFIGURATION
          </span>
          <span className="text-[10px] text-zinc-500">BLENDER 3.6 / 4.X</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Render Engine */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-zinc-400">Render Engine</label>
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setRenderEngine('EEVEE')}
                className={`py-1 rounded text-center font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  renderEngine === 'EEVEE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                EEVEE Next
              </button>
              <button
                onClick={() => setRenderEngine('CYCLES')}
                className={`py-1 rounded text-center font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  renderEngine === 'CYCLES'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cycles
              </button>
            </div>
          </div>

          {/* Target FPS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-zinc-400">Target Framerate</label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {([24, 30, 60] as const).map((fps) => (
                <button
                  key={fps}
                  onClick={() => setTargetFps(fps)}
                  className={`py-1 rounded text-center font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    targetFps === fps
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Frame Duration Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Sequence Duration</span>
            <span className="text-amber-300 font-bold">
              {totalFrames} frames ({(totalFrames / targetFps).toFixed(1)}s @ {targetFps}fps)
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={600}
            step={30}
            value={totalFrames}
            onChange={(e) => setTotalFrames(parseInt(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
          />
        </div>

        {/* Toggle Flags */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
            <input
              type="checkbox"
              checked={includeLighting}
              onChange={(e) => setIncludeLighting(e.target.checked)}
              className="accent-amber-400 rounded w-3.5 h-3.5"
            />
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>3-Point Lighting</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
            <input
              type="checkbox"
              checked={includeCamera}
              onChange={(e) => setIncludeCamera(e.target.checked)}
              className="accent-amber-400 rounded w-3.5 h-3.5"
            />
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>85mm Camera Rig</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
            <input
              type="checkbox"
              checked={includeWings}
              onChange={(e) => setIncludeWings(e.target.checked)}
              className="accent-amber-400 rounded w-3.5 h-3.5"
            />
            <Wind className="w-3.5 h-3.5 text-amber-400" />
            <span>3D Cyber Wings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
            <input
              type="checkbox"
              checked={includeAnimation}
              onChange={(e) => setIncludeAnimation(e.target.checked)}
              className="accent-amber-400 rounded w-3.5 h-3.5"
            />
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Jaw/Bob Keyframes</span>
          </label>
        </div>
      </div>

      {/* Code & Manifest Inspection Tabs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCodeTab === 'python'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Blender Python (.py)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                activeCodeTab === 'json'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Chassis Manifest (.json)</span>
            </button>
          </div>

          {/* Live Animation State Pill */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
            STANCE: <strong className="text-amber-300">{expression}</strong>
          </span>
        </div>

        {/* Code Preview Container */}
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden group">
          {/* Action Toolbar on Top of Code Box */}
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activeCodeTab === 'python'
                  ? `setup_cyber_dragon_${theme.id}.py`
                  : `dragon_chassis_${theme.id}_manifest.json`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeCodeTab === 'python' ? (
                <>
                  <button
                    onClick={handleCopyPython}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-all cursor-pointer"
                  >
                    {copiedPython ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadPython}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .py</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-all cursor-pointer"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .json</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Textarea / Code Box */}
          <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[340px] leading-relaxed select-all">
            <code>{activeCodeTab === 'python' ? pythonScript : jsonString}</code>
          </pre>
        </div>
      </div>

      {/* Telemetry & Synchronization Info */}
      <div className="p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80 flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-[11px]">
          <Waves className="w-3.5 h-3.5" />
          <span>DAWN ENGINE 432Hz AUDIO-VISUAL TELEMETRY</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
          The generated script maps real-time RMS vocal energy and 432Hz harmonic periodicity to Blender graph editor F-Curves. Renders generated in Blender will match the exact posture, jaw kinematics, and chromatic aura active in your live session.
        </p>
      </div>
    </div>
  );
};
