// components/ZoomableImage.tsx
import { Image } from 'expo-image';
import React from 'react';
import {
    PinchGestureHandler,
    PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type Props = {
  uri: string;
  width: number;
  height: number;
};

const ZoomableImage = ({ uri, width, height }: Props) => {
  const scale = useSharedValue(1);

  const onPinchEvent = (event: PinchGestureHandlerGestureEvent) => {
    scale.value = event.nativeEvent.scale;
  };

  const onPinchEnd = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <PinchGestureHandler onGestureEvent={onPinchEvent} onEnded={onPinchEnd}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default ZoomableImage;
