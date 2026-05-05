"""
Yoga pose definitions with ideal joint angles and flow sequences
"""

# Each pose: name, description, ideal angles (in degrees), feedback cues
YOGA_POSES = {
    "mountain_pose": {
        "name": "Mountain Pose",
        "sanskrit": "Tadasana",
        "description": "Stand tall, feet together, arms at sides",
        "difficulty": "beginner",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 175,
            "right_knee": 175,
            "left_hip": 175,
            "right_hip": 175,
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 10,
            "right_shoulder": 10,
            "left_ankle": 85,
            "right_ankle": 85
        },
        "angle_tolerance": {
            "left_knee": 10,
            "right_knee": 10,
            "left_hip": 10,
            "right_hip": 10,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_ankle": 10,
            "right_ankle": 10
        },
        "feedback_cues": {
            "left_knee": "Straighten your left knee",
            "right_knee": "Straighten your right knee",
            "left_shoulder": "Relax your left shoulder down",
            "right_shoulder": "Relax your right shoulder down",
            "left_hip": "Align your hips",
            "right_hip": "Align your hips"
        }
    },
    "warrior_1": {
        "name": "Warrior I",
        "sanskrit": "Virabhadrasana I",
        "description": "Lunge with arms raised overhead",
        "difficulty": "beginner",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 90,
            "right_knee": 170,
            "left_hip": 100,
            "right_hip": 160,
            "left_elbow": 170,
            "right_elbow": 170,
            "left_shoulder": 170,
            "right_shoulder": 170,
            "left_ankle": 80,
            "right_ankle": 100
        },
        "angle_tolerance": {
            "left_knee": 15,
            "right_knee": 15,
            "left_hip": 15,
            "right_hip": 15,
            "left_elbow": 20,
            "right_elbow": 20,
            "left_shoulder": 20,
            "right_shoulder": 20,
            "left_ankle": 15,
            "right_ankle": 15
        },
        "feedback_cues": {
            "left_knee": "Bend your front knee to 90 degrees",
            "right_knee": "Keep your back leg straight",
            "left_shoulder": "Raise your arms higher",
            "right_shoulder": "Raise your arms higher",
            "left_hip": "Square your hips forward"
        }
    },
    "warrior_2": {
        "name": "Warrior II",
        "sanskrit": "Virabhadrasana II",
        "description": "Lunge with arms extended to the sides",
        "difficulty": "beginner",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 90,
            "right_knee": 170,
            "left_hip": 90,
            "right_hip": 150,
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 90,
            "right_shoulder": 90,
            "left_ankle": 80,
            "right_ankle": 100
        },
        "angle_tolerance": {
            "left_knee": 15,
            "right_knee": 15,
            "left_hip": 15,
            "right_hip": 15,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_ankle": 15,
            "right_ankle": 15
        },
        "feedback_cues": {
            "left_knee": "Deepen your front knee bend",
            "left_shoulder": "Extend arms parallel to floor",
            "right_shoulder": "Extend arms parallel to floor",
            "right_knee": "Straighten your back leg"
        }
    },
    "tree_pose": {
        "name": "Tree Pose",
        "sanskrit": "Vrksasana",
        "description": "Balance on one leg with other foot on inner thigh",
        "difficulty": "intermediate",
        "duration_target": 8,
        "ideal_angles": {
            "left_knee": 175,
            "right_knee": 45,
            "left_hip": 175,
            "right_hip": 60,
            "left_elbow": 170,
            "right_elbow": 170,
            "left_shoulder": 170,
            "right_shoulder": 170,
            "left_ankle": 85,
            "right_ankle": 45
        },
        "angle_tolerance": {
            "left_knee": 10,
            "right_knee": 15,
            "left_hip": 10,
            "right_hip": 15,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 20,
            "right_shoulder": 20,
            "left_ankle": 10,
            "right_ankle": 15
        },
        "feedback_cues": {
            "left_knee": "Keep standing leg straight",
            "right_knee": "Bend lifted knee outward",
            "left_shoulder": "Bring palms together overhead",
            "right_shoulder": "Bring palms together overhead"
        }
    },
    "downward_dog": {
        "name": "Downward Dog",
        "sanskrit": "Adho Mukha Svanasana",
        "description": "Inverted V shape with hands and feet on floor",
        "difficulty": "beginner",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 170,
            "right_knee": 170,
            "left_hip": 60,
            "right_hip": 60,
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 60,
            "right_shoulder": 60,
            "left_ankle": 60,
            "right_ankle": 60
        },
        "angle_tolerance": {
            "left_knee": 15,
            "right_knee": 15,
            "left_hip": 15,
            "right_hip": 15,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_ankle": 15,
            "right_ankle": 15
        },
        "feedback_cues": {
            "left_knee": "Straighten your knees",
            "right_knee": "Straighten your knees",
            "left_hip": "Lift your hips higher",
            "right_hip": "Lift your hips higher",
            "left_shoulder": "Press through your palms"
        }
    },
    "chair_pose": {
        "name": "Chair Pose",
        "sanskrit": "Utkatasana",
        "description": "Squat with arms raised overhead",
        "difficulty": "beginner",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 90,
            "right_knee": 90,
            "left_hip": 90,
            "right_hip": 90,
            "left_elbow": 170,
            "right_elbow": 170,
            "left_shoulder": 160,
            "right_shoulder": 160,
            "left_ankle": 70,
            "right_ankle": 70
        },
        "angle_tolerance": {
            "left_knee": 15,
            "right_knee": 15,
            "left_hip": 15,
            "right_hip": 15,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 20,
            "right_shoulder": 20,
            "left_ankle": 15,
            "right_ankle": 15
        },
        "feedback_cues": {
            "left_knee": "Bend knees more deeply",
            "right_knee": "Bend knees more deeply",
            "left_shoulder": "Raise arms parallel overhead",
            "right_shoulder": "Raise arms parallel overhead"
        }
    },
    "triangle_pose": {
        "name": "Triangle Pose",
        "sanskrit": "Trikonasana",
        "description": "Standing wide-leg lateral stretch",
        "difficulty": "intermediate",
        "duration_target": 5,
        "ideal_angles": {
            "left_knee": 175,
            "right_knee": 175,
            "left_hip": 45,
            "right_hip": 135,
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 170,
            "right_shoulder": 10,
            "left_ankle": 85,
            "right_ankle": 65
        },
        "angle_tolerance": {
            "left_knee": 10,
            "right_knee": 10,
            "left_hip": 15,
            "right_hip": 15,
            "left_elbow": 15,
            "right_elbow": 15,
            "left_shoulder": 20,
            "right_shoulder": 15,
            "left_ankle": 10,
            "right_ankle": 10
        },
        "feedback_cues": {
            "left_knee": "Straighten your front knee",
            "left_shoulder": "Reach your top arm up",
            "left_hip": "Tilt from your hips, not waist"
        }
    }
}

# Predefined yoga flow sequences
YOGA_FLOWS = {
    "beginner_flow": {
        "name": "Beginner Morning Flow",
        "description": "Gentle 7-pose sequence for beginners",
        "difficulty": "beginner",
        "estimated_duration": 20,
        "poses": [
            "mountain_pose",
            "chair_pose",
            "warrior_1",
            "warrior_2",
            "triangle_pose",
            "downward_dog",
            "mountain_pose"
        ]
    },
    "strength_flow": {
        "name": "Strength Builder Flow",
        "description": "Build strength and balance",
        "difficulty": "intermediate",
        "estimated_duration": 25,
        "poses": [
            "mountain_pose",
            "warrior_1",
            "warrior_2",
            "chair_pose",
            "tree_pose",
            "warrior_1",
            "downward_dog"
        ]
    },
    "balance_flow": {
        "name": "Balance & Focus Flow",
        "description": "Improve balance and mental focus",
        "difficulty": "intermediate",
        "estimated_duration": 20,
        "poses": [
            "mountain_pose",
            "tree_pose",
            "warrior_1",
            "warrior_2",
            "triangle_pose",
            "downward_dog",
            "mountain_pose"
        ]
    }
}

def get_pose(pose_key: str) -> dict:
    return YOGA_POSES.get(pose_key)

def get_flow(flow_key: str) -> dict:
    return YOGA_FLOWS.get(flow_key)

def get_all_poses() -> dict:
    return YOGA_POSES

def get_all_flows() -> dict:
    return YOGA_FLOWS
