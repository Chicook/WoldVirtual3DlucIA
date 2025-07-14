import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Environment } from '@/types/metaverso'

interface WorldTerrainProps {
  environment: Environment
  size?: number
  resolution?: number
}

export const WorldTerrain: React.FC<WorldTerrainProps> = ({
  environment,
  size = 1000,
  resolution = 256
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  useGLTF('/models/terrain.glb')

  // Generar geometría del terreno
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1)
    
    // Aplicar altura basada en el tipo de ambiente
    const positions = geo.attributes.position.array as Float32Array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      
      // Generar altura según el tipo de ambiente
      let height = 0

      switch (environment.type) {

      switch (environment) {

      switch (environment) {

      switch (environment.type) {
        case 'forest':
          height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 10 + 
                   Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2
          break
        case 'desert':
          height = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
                   Math.random() * 3
          break

        case 'snow':

        case 'urban':

        case 'urban':

        case 'snow':
          height = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 15 + 
                   Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5
          break
        case 'urban':
          height = Math.floor(Math.random() * 3) * 2
          break
        case 'underwater':
          height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 3 - 5
          break
        case 'space':
          height = Math.sin(x * 0.005) * Math.cos(z * 0.005) * 20
          break
        default:
          height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 5
      }
      
      positions[i + 1] = height
    }
    
    geo.computeVertexNormals()
    return geo

  }, [environment, size, resolution])

  // Generar material según el ambiente
  const material = useMemo(() => {
    const baseColor = getEnvironmentColor(environment)
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: getEnvironmentRoughness(environment),
      metalness: getEnvironmentMetalness(environment),
      wireframe: false
    })
  }, [environment])

  }, [environment.type, size, resolution])

  // Generar material según el ambiente
  const material = useMemo(() => {
    const baseColor = getEnvironmentColor(environment.type)
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: getEnvironmentRoughness(environment.type),
      metalness: getEnvironmentMetalness(environment.type),
      wireframe: false
    })
  }, [environment.type])

  }, [environment, size, resolution])

  // Generar material según el ambiente
  const material = useMemo(() => {
    const baseColor = getEnvironmentColor(environment)
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: getEnvironmentRoughness(environment),
      metalness: getEnvironmentMetalness(environment),
      wireframe: false
    })
  }, [environment])

  // Animación del terreno
  useFrame(() => {
    if (meshRef.current) {
      // Animación simple del terreno
      meshRef.current.rotation.y += 0.001
    }
  })

  // Obtener color base del ambiente

  const getEnvironmentColor = (type: Environment) => {
    switch (type) {
      case 'forest': return '#2d5016'
      case 'desert': return '#d2b48c'
      case 'urban': return '#696969'
      case 'underwater': return '#006994'
      case 'space': return '#1a1a2e'
      case 'indoor': return '#8b4513'
      case 'outdoor': return '#4a7c59'
      case 'underground': return '#2d2d2d'

  const getEnvironmentColor = (type: string) => {
    switch (type) {
      case 'forest': return '#2d5016'
      case 'desert': return '#d2b48c'
      case 'snow': return '#f0f8ff'
      case 'urban': return '#696969'
      case 'underwater': return '#006994'
      case 'space': return '#1a1a2e'

  const getEnvironmentColor = (type: Environment) => {
    switch (type) {
      case 'forest': return '#2d5016'
      case 'desert': return '#d2b48c'
      case 'urban': return '#696969'
      case 'underwater': return '#006994'
      case 'space': return '#1a1a2e'
      case 'indoor': return '#8b4513'
      case 'outdoor': return '#4a7c59'
      case 'underground': return '#2d2d2d'

      default: return '#4a7c59'
    }
  }

  // Obtener rugosidad del material

  const getEnvironmentRoughness = (type: Environment) => {
    switch (type) {
      case 'forest': return 0.8
      case 'desert': return 0.9
      case 'urban': return 0.7
      case 'underwater': return 0.1
      case 'space': return 0.5
      case 'indoor': return 0.6
      case 'outdoor': return 0.7
      case 'underground': return 0.9

  const getEnvironmentRoughness = (type: string) => {
    switch (type) {
      case 'forest': return 0.8
      case 'desert': return 0.9
      case 'snow': return 0.3
      case 'urban': return 0.7
      case 'underwater': return 0.1
      case 'space': return 0.5

  const getEnvironmentRoughness = (type: Environment) => {
    switch (type) {
      case 'forest': return 0.8
      case 'desert': return 0.9
      case 'urban': return 0.7
      case 'underwater': return 0.1
      case 'space': return 0.5
      case 'indoor': return 0.6
      case 'outdoor': return 0.7
      case 'underground': return 0.9

      default: return 0.6
    }
  }

  // Obtener metalicidad del material

  const getEnvironmentMetalness = (type: Environment) => {
    switch (type) {
      case 'forest': return 0.0
      case 'desert': return 0.0
      case 'urban': return 0.3
      case 'underwater': return 0.8
      case 'space': return 0.2
      case 'indoor': return 0.1
      case 'outdoor': return 0.0
      case 'underground': return 0.1

  const getEnvironmentMetalness = (type: string) => {
    switch (type) {
      case 'forest': return 0.0
      case 'desert': return 0.0
      case 'snow': return 0.1
      case 'urban': return 0.3
      case 'underwater': return 0.8
      case 'space': return 0.2

  const getEnvironmentMetalness = (type: Environment) => {
    switch (type) {
      case 'forest': return 0.0
      case 'desert': return 0.0
      case 'urban': return 0.3
      case 'underwater': return 0.8
      case 'space': return 0.2
      case 'indoor': return 0.1
      case 'outdoor': return 0.0
      case 'underground': return 0.1

      default: return 0.0
    }
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0]}
      receiveShadow
    >
      {/* Efectos adicionales según el ambiente */}

      {environment.type === 'underwater' && (

      {environment === 'underwater' && (

      {environment === 'underwater' && (

      {environment.type === 'underwater' && (
        <meshStandardMaterial
          transparent
          opacity={0.7}
          color="#006994"
        />
      )}

      {environment.type === 'space' && (

      {environment === 'space' && (

      {environment === 'space' && (

      {environment.type === 'space' && (
        <pointLight
          color="#ffffff"
          intensity={0.5}
          distance={100}
          position={[0, 50, 0]}
        />
      )}
    </mesh>
  )
}

export default WorldTerrain