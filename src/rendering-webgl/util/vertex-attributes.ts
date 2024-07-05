import { BYTE_SIZE, FLOAT_SIZE, INT_16_SIZE, INT_32_SIZE } from '../../util';

/**
 * Available integer vertex attribute types.
 *
 * @category Rendering - WebGL
 */
export type IntVertexAttributeType =
    | 'byte'
    | 'unsignedByte'
    | 'short'
    | 'unsignedShort'
    | 'int'
    | 'unsignedInt'
    | 'int-2-10-10-10-rev'
    | 'unsignedInt-2-10-10-10-rev';

/**
 * Available float vertex attribute types.
 *
 * @category Rendering - WebGL
 */
export type FloatVertexAttributeType = 'halfFloat' | 'float';

/**
 * Available vertex attribute types.
 *
 * @category Rendering - WebGL
 */
export type VertexAttributeType =
    | IntVertexAttributeType
    | FloatVertexAttributeType;

/**
 * Is the given type an integer type? Might require using `vertexAttribIPointer`.
 * @param type - Type
 * @returns `true` if integer type
 *
 * @category Rendering - WebGL
 */
export function isIntType(
    type: VertexAttributeType,
): type is IntVertexAttributeType {
    return type !== 'halfFloat' && type !== 'float';
}

/**
 * A vertex attribute.
 *
 * @category Rendering - WebGL
 */
export interface VertexAttribute {
    /** Attribute index/location. */
    index?: number;

    /** Size of the attribute (number of components). */
    size: number;

    /** Type. */
    type: VertexAttributeType;

    /** Normalize (e.g. unsigned byte [0, 255] into float [0, 1.0]). */
    normalize?: boolean;

    /** Stride if interleaved. */
    stride?: number;

    /** Offset if interleaved. */
    offset?: number;

    /** Divisor.  */
    divisor?: number;
}

/**
 * Set vertex attributes for the currently bound buffer.
 * @param gl - GL
 * @param attributes - Vertex attributes in order
 * @param options - Options to apply to all attributes
 *
 * @category Rendering - WebGL
 */
export function setVertexAttributes(
    gl: WebGL2RenderingContext,
    attributes: VertexAttribute[],
    options?: {
        /** Index to start counting attributes from. Individually set index will override this! */
        index?: number;
        /** Stride to apply to all attributes. Individually set stride will override this! */
        stride?: number;
        /** Offset to start from. Individually set offset will override this! */
        offset?: number;
        /** Divisor to apply to all attributes. Individually set divisor will override this! */
        divisor?: number;
    },
) {
    const stride = options?.stride ?? 0;

    let index = options?.index ?? 0;

    let offsetInStride = options?.offset ?? 0;

    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i]!;

        index = attr.index ?? index;

        gl.enableVertexAttribArray(index);

        if (isIntType(attr.type) && !attr.normalize) {
            gl.vertexAttribIPointer(
                index,
                attr.size,
                getTypeWebGLType(gl, attr.type),
                attr.stride ?? stride,
                attr.offset ?? offsetInStride,
            );
        } else {
            gl.vertexAttribPointer(
                index,
                attr.size,
                getTypeWebGLType(gl, attr.type),
                attr.normalize ?? false,
                attr.stride ?? stride,
                attr.offset ?? offsetInStride,
            );
        }

        const divisor = attr.divisor ?? options?.divisor;

        if (divisor != undefined) {
            gl.vertexAttribDivisor(index, divisor);
        }

        offsetInStride += getTypeSize(attr.type) * attr.size;

        index++;
    }
}

/**
 * Get the WebGL type constant for a type.
 * @param gl - GL
 * @param type - Type
 * @returns WebGL type constant
 *
 * @category Rendering - WebGL
 */
export function getTypeWebGLType(
    gl: WebGL2RenderingContext,
    type: VertexAttributeType,
) {
    switch (type) {
        case 'byte':
            return gl.BYTE;

        case 'unsignedByte':
            return gl.UNSIGNED_BYTE;

        case 'short':
            return gl.SHORT;

        case 'unsignedShort':
            return gl.UNSIGNED_SHORT;

        case 'halfFloat':
            return gl.HALF_FLOAT;

        case 'int':
            return gl.INT;

        case 'unsignedInt':
            return gl.UNSIGNED_INT;

        case 'int-2-10-10-10-rev':
            return gl.INT_2_10_10_10_REV;

        case 'unsignedInt-2-10-10-10-rev':
            return gl.UNSIGNED_INT_2_10_10_10_REV;

        case 'float':
            return gl.FLOAT;

        default:
            throw new Error(`Unknown vertex attribute type ${type}`);
    }
}

/**
 * Get byte size of the given type.
 * @param type - Type
 * @returns Size in bytes
 *
 * @category Rendering - WebGL
 */
export function getTypeSize(type: VertexAttributeType) {
    switch (type) {
        case 'byte':
            return BYTE_SIZE;

        case 'unsignedByte':
            return BYTE_SIZE;

        case 'short':
        case 'unsignedShort':
            return INT_16_SIZE;

        case 'halfFloat':
            return FLOAT_SIZE / 2;

        case 'int':
        case 'unsignedInt':
        case 'int-2-10-10-10-rev':
        case 'unsignedInt-2-10-10-10-rev':
            return INT_32_SIZE;

        case 'float':
            return FLOAT_SIZE;

        default:
            throw new Error(`Unknown vertex attribute type ${type}`);
    }
}
