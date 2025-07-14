/// <reference types="vite/client" />

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// WebGPU types fallback
declare namespace WebGPU {
  interface GPUAdapter {}
  interface GPUDevice {}
  interface GPUBuffer {}
  interface GPUTexture {}
  interface GPUSampler {}
  interface GPUBindGroup {}
  interface GPUBindGroupLayout {}
  interface GPUPipelineLayout {}
  interface GPUShaderModule {}
  interface GPUComputePipeline {}
  interface GPURenderPipeline {}
  interface GPUCommandEncoder {}
  interface GPURenderPassEncoder {}
  interface GPUComputePassEncoder {}
  interface GPUCommandBuffer {}
  interface GPUQueue {}
  interface GPUSwapChain {}
  interface GPUTextureView {}
  interface GPURenderBundle {}
  interface GPURenderBundleEncoder {}
  interface GPUQuerySet {}
  interface GPUCanvasContext {}
  interface GPUExternalTexture {}
  interface GPUCompilationMessage {}
  interface GPUCompilationInfo {}
  interface GPUDeviceLostInfo {}
  interface GPUError {}
  interface GPUValidationError {}
  interface GPUOutOfMemoryError {}
  interface GPUInternalError {}
  interface GPUBufferDescriptor {}
  interface GPUTextureDescriptor {}
  interface GPUTextureViewDescriptor {}
  interface GPUSamplerDescriptor {}
  interface GPUBindGroupDescriptor {}
  interface GPUBindGroupLayoutDescriptor {}
  interface GPUPipelineLayoutDescriptor {}
  interface GPUShaderModuleDescriptor {}
  interface GPUShaderModuleCompilationHint {}
  interface GPUComputePipelineDescriptor {}
  interface GPURenderPipelineDescriptor {}
  interface GPUVertexState {}
  interface GPUFragmentState {}
  interface GPUColorTargetState {}
  interface GPUBlendState {}
  interface GPUVertexAttribute {}
  interface GPUVertexBufferLayout {}
  interface GPUVertexStateDescriptor {}
  interface GPUPrimitiveState {}
  interface GPUMultisampleState {}
  interface GPUDepthStencilState {}
  interface GPUCommandEncoderDescriptor {}
  interface GPURenderPassDescriptor {}
  interface GPURenderPassColorAttachment {}
  interface GPURenderPassDepthStencilAttachment {}
  interface GPURenderPassLayout {}
  interface GPUComputePassDescriptor {}
  interface GPURenderBundleDescriptor {}
  interface GPURenderBundleEncoderDescriptor {}
  interface GPUQuerySetDescriptor {}
  interface GPUCanvasConfiguration {}
  interface GPUExternalTextureDescriptor {}
  interface GPUAdapterInfo {}
  interface GPUAdapterFeatures {}
  interface GPUAdapterLimits {}
  interface GPUDeviceDescriptor {}
  interface GPUQueueDescriptor {}
  interface GPUSwapChainDescriptor {}
  interface GPUTextureDataLayout {}
  interface GPUImageCopyBuffer {}
  interface GPUImageCopyTexture {}
  interface GPUImageCopyExternalImage {}
  interface GPUImageCopyTextureTagged {}
  interface GPUImageDataLayout {}
  interface GPUOrigin3D {}
  interface GPUExtent3D {}
  interface GPULimits {}
  interface GPUFeatureName {}
  interface GPUTextureFormat {}
  interface GPUTextureUsage {}
  interface GPUBufferUsage {}
  interface GPUMapMode {}
  interface GPUShaderStage {}
  interface GPUBindingResource {}
  interface GPUBufferBinding {}
  interface GPUSamplerBinding {}
  interface GPUTextureViewBinding {}
  interface GPUExternalTextureBinding {}
  interface GPUBindGroupEntry {}
  interface GPUBindGroupLayoutEntry {}
  interface GPUShaderModuleCompilationHint {}
  interface GPUCompilationMessage {}
  interface GPUCompilationInfo {}
  interface GPUDeviceLostInfo {}
  interface GPUError {}
  interface GPUValidationError {}
  interface GPUOutOfMemoryError {}
  interface GPUInternalError {}
  interface GPUPopErrorScopeResult {}
  interface GPUUncapturedErrorEvent {}
  interface GPUAdapter {}
  interface GPUDevice {}
  interface GPUBuffer {}
  interface GPUTexture {}
  interface GPUSampler {}
  interface GPUBindGroup {}
  interface GPUBindGroupLayout {}
  interface GPUPipelineLayout {}
  interface GPUShaderModule {}
  interface GPUComputePipeline {}
  interface GPURenderPipeline {}
  interface GPUCommandEncoder {}
  interface GPURenderPassEncoder {}
  interface GPUComputePassEncoder {}
  interface GPUCommandBuffer {}
  interface GPUQueue {}
  interface GPUSwapChain {}
  interface GPUTextureView {}
  interface GPURenderBundle {}
  interface GPURenderBundleEncoder {}
  interface GPUQuerySet {}
  interface GPUCanvasContext {}
  interface GPUExternalTexture {}
  interface GPUCompilationMessage {}
  interface GPUCompilationInfo {}
  interface GPUDeviceLostInfo {}
  interface GPUError {}
  interface GPUValidationError {}
  interface GPUOutOfMemoryError {}
  interface GPUInternalError {}
  interface GPUBufferDescriptor {}
  interface GPUTextureDescriptor {}
  interface GPUTextureViewDescriptor {}
  interface GPUSamplerDescriptor {}
  interface GPUBindGroupDescriptor {}
  interface GPUBindGroupLayoutDescriptor {}
  interface GPUPipelineLayoutDescriptor {}
  interface GPUShaderModuleDescriptor {}
  interface GPUShaderModuleCompilationHint {}
  interface GPUComputePipelineDescriptor {}
  interface GPURenderPipelineDescriptor {}
  interface GPUVertexState {}
  interface GPUFragmentState {}
  interface GPUColorTargetState {}
  interface GPUBlendState {}
  interface GPUVertexAttribute {}
  interface GPUVertexBufferLayout {}
  interface GPUVertexStateDescriptor {}
  interface GPUPrimitiveState {}
  interface GPUMultisampleState {}
  interface GPUDepthStencilState {}
  interface GPUCommandEncoderDescriptor {}
  interface GPURenderPassDescriptor {}
  interface GPURenderPassColorAttachment {}
  interface GPURenderPassDepthStencilAttachment {}
  interface GPURenderPassLayout {}
  interface GPUComputePassDescriptor {}
  interface GPURenderBundleDescriptor {}
  interface GPURenderBundleEncoderDescriptor {}
  interface GPUQuerySetDescriptor {}
  interface GPUCanvasConfiguration {}
  interface GPUExternalTextureDescriptor {}
  interface GPUAdapterInfo {}
  interface GPUAdapterFeatures {}
  interface GPUAdapterLimits {}
  interface GPUDeviceDescriptor {}
  interface GPUQueueDescriptor {}
  interface GPUSwapChainDescriptor {}
  interface GPUTextureDataLayout {}
  interface GPUImageCopyBuffer {}
  interface GPUImageCopyTexture {}
  interface GPUImageCopyExternalImage {}
  interface GPUImageCopyTextureTagged {}
  interface GPUImageDataLayout {}
  interface GPUOrigin3D {}
  interface GPUExtent3D {}
  interface GPULimits {}
  interface GPUFeatureName {}
  interface GPUTextureFormat {}
  interface GPUTextureUsage {}
  interface GPUBufferUsage {}
  interface GPUMapMode {}
  interface GPUShaderStage {}
  interface GPUBindingResource {}
  interface GPUBufferBinding {}
  interface GPUSamplerBinding {}
  interface GPUTextureViewBinding {}
  interface GPUExternalTextureBinding {}
  interface GPUBindGroupEntry {}
  interface GPUBindGroupLayoutEntry {}
  interface GPUShaderModuleCompilationHint {}
  interface GPUCompilationMessage {}
  interface GPUCompilationInfo {}
  interface GPUDeviceLostInfo {}
  interface GPUError {}
  interface GPUValidationError {}
  interface GPUOutOfMemoryError {}
  interface GPUInternalError {}
  interface GPUPopErrorScopeResult {}
  interface GPUUncapturedErrorEvent {}
}

declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(options?: any): Promise<WebGPU.GPUAdapter | null>;
    };
  }
} 